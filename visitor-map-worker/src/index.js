function corsHeaders(allowedOrigin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}

function json(data, allowedOrigin, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(allowedOrigin),
    },
  });
}

function toSQLiteTimestamp(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function cleanText(value, maxLength = 160) {
  if (!value) return null;

  return String(value).trim().slice(0, maxLength) || null;
}

function parseCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getAllowedOrigin(request, env) {
  const configured = cleanText(env.ALLOWED_ORIGIN, 200);
  const requestOrigin = request.headers.get("Origin");

  if (!configured) return "*";
  if (!requestOrigin) return configured;
  return requestOrigin === configured ? configured : "";
}

async function handleVisit(request, env, allowedOrigin) {
  if (!allowedOrigin) {
    return json({ error: "Origin not allowed." }, "", 403);
  }

  const cf = request.cf || {};
  const payloadText = await request.text();
  let payload = {};

  if (payloadText) {
    try {
      payload = JSON.parse(payloadText);
    } catch (_error) {
      return json({ error: "Invalid JSON payload." }, allowedOrigin, 400);
    }
  }

  const ipAddress = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
  const userAgent = request.headers.get("User-Agent") || "";
  const salt = env.VISITOR_SALT || "replace-me";
  const visitorHash = await sha256Hex([ipAddress, userAgent, salt].join("|"));
  const countryCode = cleanText(cf.country, 8) || "";
  const region = cleanText(cf.region || cf.regionCode, 120) || "";
  const city = cleanText(cf.city, 120) || "";

  await env.DB.prepare(
    `
      INSERT INTO visitor_locations (
        visitor_hash,
        country_code,
        country,
        region,
        city,
        latitude,
        longitude,
        last_path,
        last_referrer
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(visitor_hash, country_code, region, city)
      DO UPDATE SET
        visits = visitor_locations.visits + 1,
        last_seen = CURRENT_TIMESTAMP,
        latitude = COALESCE(excluded.latitude, visitor_locations.latitude),
        longitude = COALESCE(excluded.longitude, visitor_locations.longitude),
        country = COALESCE(excluded.country, visitor_locations.country),
        region = COALESCE(excluded.region, visitor_locations.region),
        city = COALESCE(excluded.city, visitor_locations.city),
        last_path = excluded.last_path,
        last_referrer = excluded.last_referrer
    `
  )
    .bind(
      visitorHash,
      countryCode,
      cleanText(cf.countryName || cf.country, 120) || countryCode,
      region,
      city,
      parseCoordinate(cf.latitude),
      parseCoordinate(cf.longitude),
      cleanText(payload.path, 200),
      cleanText(payload.referrer, 300)
    )
    .run();

  return json({ ok: true }, allowedOrigin, 202);
}

async function handleVisitors(request, env, allowedOrigin) {
  if (!allowedOrigin) {
    return json({ error: "Origin not allowed." }, "", 403);
  }

  const url = new URL(request.url);
  const limit = clamp(Number(url.searchParams.get("limit") || 150), 1, 300);
  const days = clamp(Number(url.searchParams.get("days") || 3650), 1, 3650);
  const cutoff = toSQLiteTimestamp(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

  const summary = await env.DB.prepare(
    `
      SELECT
        COALESCE(SUM(visits), 0) AS total_visits,
        COUNT(DISTINCT visitor_hash) AS unique_visitors,
        COUNT(DISTINCT country_code) AS countries,
        MAX(last_seen) AS last_seen
      FROM visitor_locations
      WHERE last_seen >= ?
    `
  )
    .bind(cutoff)
    .first();

  const locationSummary = await env.DB.prepare(
    `
      SELECT COUNT(*) AS unique_locations
      FROM (
        SELECT 1
        FROM visitor_locations
        WHERE last_seen >= ?
        GROUP BY country_code, region, city
      )
    `
  )
    .bind(cutoff)
    .first();

  const visitorsResult = await env.DB.prepare(
    `
      SELECT
        country_code,
        country,
        region,
        city,
        ROUND(AVG(latitude), 4) AS latitude,
        ROUND(AVG(longitude), 4) AS longitude,
        SUM(visits) AS visits,
        COUNT(*) AS unique_visitors,
        MAX(last_seen) AS last_seen
      FROM visitor_locations
      WHERE last_seen >= ?
      GROUP BY country_code, country, region, city
      ORDER BY visits DESC, last_seen DESC
      LIMIT ?
    `
  )
    .bind(cutoff, limit)
    .all();

  const countryResult = await env.DB.prepare(
    `
      SELECT
        country_code,
        country,
        SUM(visits) AS visits
      FROM visitor_locations
      WHERE last_seen >= ?
      GROUP BY country_code, country
      ORDER BY visits DESC, country ASC
      LIMIT 8
    `
  )
    .bind(cutoff)
    .all();

  const recentResult = await env.DB.prepare(
    `
      SELECT
        country_code,
        country,
        region,
        city,
        MAX(last_seen) AS last_seen
      FROM visitor_locations
      WHERE last_seen >= ?
      GROUP BY country_code, country, region, city
      ORDER BY last_seen DESC
      LIMIT 8
    `
  )
    .bind(cutoff)
    .all();

  return json(
    {
      summary: {
        total_visits: summary?.total_visits || 0,
        unique_visitors: summary?.unique_visitors || 0,
        unique_locations: locationSummary?.unique_locations || 0,
        countries: summary?.countries || 0,
        last_seen: summary?.last_seen || null,
      },
      visitors: visitorsResult.results || [],
      countries: countryResult.results || [],
      recent: recentResult.results || [],
    },
    allowedOrigin
  );
}

export default {
  async fetch(request, env) {
    const allowedOrigin = getAllowedOrigin(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowedOrigin),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/visit") {
      return handleVisit(request, env, allowedOrigin);
    }

    if (request.method === "GET" && url.pathname === "/api/visitors") {
      return handleVisitors(request, env, allowedOrigin);
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true }, allowedOrigin);
    }

    return json({ error: "Not found." }, allowedOrigin, 404);
  },
};
