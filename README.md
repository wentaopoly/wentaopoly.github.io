# wentaopoly.github.io

Source of <https://wentaopoly.github.io>: a small Jekyll site in English, Chinese and French.

## Where things are

| Path | What it holds |
|---|---|
| `index.html`, `zh/index.html`, `fr/index.html` | Home page text, one file per language |
| `cpdag.html` (+ `zh/`, `fr/`) | NeurIPS 2026 paper page; its strings and numbers are in `_data/cpdag.yml` |
| `projects/*.html` (+ `zh/`, `fr/`) | One page per project; the list itself is `_data/projects.yml` and `_data/earlier.yml` |
| `cv.html` (+ `zh/`, `fr/`) | CV pages, all rendered from `_data/cv.yml` by `_includes/cv.html` |
| `_data/publications.yml` | Papers, newest first, with BibTeX |
| `_data/news.yml` | Dated news lines, with text in each language |
| `_data/i18n.yml` | Interface labels (navigation, link names, dates) |
| `assets/css/site.css` | The only stylesheet, including the print rules used for the CV PDFs |
| `assets/js/site.js` | Language choice, BibTeX copy buttons, visitor map |
| `assets/pdf/` | `cv-en.pdf`, `cv.pdf` (Chinese, old file name kept for existing links), `cv-fr.pdf` |
| `assets/video/` | The paper's explainer video and its subtitles (`.vtt`, converted from the `.srt` files) |
| `visitor-map-worker/` | Cloudflare Worker behind the visitor map; deployed by its own workflow |

Pages in different languages are paired by the `ref` front-matter key; the language comes from the folder (`zh/`, `fr/`, or the root for English).

## Build and preview

The site needs Ruby 3.3 and Bundler. Without a local Ruby, Docker works:

```bash
docker run --rm -v "$PWD":/srv -w /srv -v site-gems:/usr/local/bundle ruby:3.3-slim \
  bash -c "apt-get update -qq && apt-get install -y -qq build-essential >/dev/null && bundle install --quiet && bundle exec jekyll build"
python3 -m http.server 4000 --directory _site
```

The visitor map only loads on https://wentaopoly.github.io, because the Worker accepts requests from that origin only.

## Common edits

- **News**: add an entry at the top of `_data/news.yml` with `date: YYYY-MM` and the text in `en`, `zh`, `fr`.
- **Paper**: add an entry to `_data/publications.yml`. Link labels must exist under `links:` in `_data/i18n.yml`.
- **CV**: edit `_data/cv.yml`, rebuild, serve `_site` on port 4000, then reprint the PDFs:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
print_cv() {
  "$CHROME" --headless=new --no-pdf-header-footer --virtual-time-budget=15000 \
    --lang="$3" --accept-lang="$3" --user-data-dir="$(mktemp -d)" --print-to-pdf="assets/pdf/$2" "http://127.0.0.1:4000$1"
}
print_cv /cv/ cv-en.pdf en-US
print_cv /zh/cv/ cv.pdf zh-CN
print_cv /fr/cv/ cv-fr.pdf fr-FR
```

`--accept-lang` matters: English pages send first-time visitors whose browser prefers Chinese or French to that version, and headless Chrome counts as a first-time visitor.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `_site/` to the `gh-pages` branch. GitHub Pages serves that branch.
