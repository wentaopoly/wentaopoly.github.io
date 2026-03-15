CREATE TABLE IF NOT EXISTS visitor_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_hash TEXT NOT NULL,
  country_code TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,
  visits INTEGER NOT NULL DEFAULT 1,
  first_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_path TEXT,
  last_referrer TEXT,
  UNIQUE(visitor_hash, country_code, region, city)
);

CREATE INDEX IF NOT EXISTS idx_visitor_locations_last_seen
  ON visitor_locations(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_locations_country
  ON visitor_locations(country_code, last_seen DESC);
