#!/usr/bin/env python3
"""
Scrape swiftrooms.ae — download all pages, images, fonts, CSS, videos.
Uses curl subprocesses to bypass WAF TLS fingerprinting.
Integrates everything into dist/ and rewrites CDN URLs to local paths.
"""

import os
import re
import time
import hashlib
import subprocess
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

SITE = "https://www.swiftrooms.ae"
DIST = Path("/Users/ariftariq/Downloads/swiftrooms-clone/dist")

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)
CURL_BASE = ["curl", "-s", "-L", "--compressed", "-A", UA,
             "-H", "Accept-Language: en-US,en;q=0.9",
             "-H", "Accept: text/html,application/xhtml+xml,*/*;q=0.8",
             "--max-time", "30"]

CDN_DOMAINS = [
    "lirp.cdn-website.com",
    "irp.cdn-website.com",
    "irp-cdn.multiscreensite.com",
    "irt-cdn.multiscreensite.com",
    "dd-cdn.multiscreensite.com",
]

# Global: CDN URL → dist-relative path
CDN_MAP: dict[str, str] = {}


# ── curl helpers ─────────────────────────────────────────────────────────────

def curl_fetch(url: str) -> tuple[int, bytes]:
    """Fetch URL with curl. Returns (status_code, body_bytes)."""
    try:
        result = subprocess.run(
            CURL_BASE + ["-w", "\n__STATUS__%{http_code}", url],
            capture_output=True, timeout=35
        )
        output = result.stdout
        # Extract status code appended at end
        if b"\n__STATUS__" in output:
            body, _, status_b = output.rpartition(b"\n__STATUS__")
            try:
                status = int(status_b.strip())
            except ValueError:
                status = 0
        else:
            body, status = output, 0
        return status, body
    except Exception as e:
        print(f"    curl ERR: {e}")
        return 0, b""


def curl_download(url: str, dest: Path) -> bool:
    """Download binary asset with curl."""
    if dest.exists() and dest.stat().st_size > 0:
        return True
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        result = subprocess.run(
            ["curl", "-s", "-L", "--compressed", "-A", UA,
             "--max-time", "30", "-o", str(dest), url],
            capture_output=True, timeout=35
        )
        if dest.exists() and dest.stat().st_size > 0:
            return True
        return False
    except Exception as e:
        print(f"    DL ERR: {e}  {url}")
        return False


# ── Asset naming ─────────────────────────────────────────────────────────────

def url_to_local_filename(url: str) -> str:
    clean = url.split("?")[0]
    basename = clean.split("/")[-1] or "asset"
    h = hashlib.md5(url.encode()).hexdigest()[:8]
    if "." in basename:
        stem, ext = basename.rsplit(".", 1)
        if len(ext) <= 6:
            return f"{stem}-{h}.{ext}"
    return f"{basename}-{h}"


def ext_to_subfolder(url: str) -> str:
    clean = url.split("?")[0].lower()
    for ext in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".ico", ".svg"):
        if clean.endswith(ext):
            return "images"
    for ext in (".mp4", ".webm", ".mov", ".ogg"):
        if clean.endswith(ext):
            return "videos"
    for ext in (".woff", ".woff2", ".ttf", ".eot", ".otf"):
        if clean.endswith(ext):
            return "fonts"
    if clean.endswith(".css"):
        return "css"
    if clean.endswith(".js"):
        return "js"
    return "images"  # default for CDN media


def is_cdn_url(url: str) -> bool:
    return any(d in url for d in CDN_DOMAINS)


def register_cdn_url(cdn_url: str) -> str:
    """Register a CDN URL and return its dist-relative path."""
    if cdn_url in CDN_MAP:
        return CDN_MAP[cdn_url]
    subfolder = ext_to_subfolder(cdn_url)
    local_name = url_to_local_filename(cdn_url)
    dist_rel = f"assets/{subfolder}/{local_name}"
    CDN_MAP[cdn_url] = dist_rel
    return dist_rel


def extract_cdn_urls(text: str) -> set[str]:
    urls = set()
    for domain in CDN_DOMAINS:
        for m in re.findall(rf'https?://{re.escape(domain)}[^\s"\'<>()\[\]]+', text):
            m = m.rstrip("'),;\".")
            if m:
                urls.add(m)
    return urls


# ── Page URL discovery ───────────────────────────────────────────────────────

def get_all_page_urls() -> list[str]:
    urls = set()
    # Try sitemap
    status, body = curl_fetch(f"{SITE}/sitemap.xml")
    if status == 200:
        for m in re.findall(r"<loc>([^<]+)</loc>", body.decode("utf-8", errors="replace")):
            m = m.strip()
            if m.startswith(SITE):
                urls.add(m.rstrip("/") or SITE + "/")
    else:
        print(f"  WARN: sitemap returned {status}")

    # Always include known aliases
    for alias in KNOWN_ALIASES:
        url = SITE + "/" if alias == "home" else f"{SITE}/{alias}"
        urls.add(url)

    return sorted(urls)


KNOWN_ALIASES = [
    "home", "4900-gallery", "al-barari", "aluminium-sliding-door-cor-vision",
    "front-entrance-doors-aluminium-paneled-glass-upvc",
    "aluminium-sliding-door-window-gulf-extrusion-al-ghurair-montana",
    "aluminium-windows-cortizo-alu-steel-classic-and-modern",
    "aluminium-windows-cortizo-cor-70-hidden-sash",
    "bi-fold-aluminium-profile-door-cortizo", "monty-s-montgomery-golf-course",
    "cortizo-cor-70-door", "cor-vision-plus", "cor-vision-gallery",
    "curtain-wall-facade-glazing-cortizo-tp52-equity",
    "curtain-wall-facade-glazing-cortizo-tp52",
    "curtain-wall-facade-gulf-extrusion-alghurair-cw-50mm",
    "brookfields---damac-hills---dubai", "phoenix-damac-hills", "emirates-hills",
    "jumeirah-village-triangle-district-5", "glass-room-abu-dhabi",
    "phileas-fogg---dubai", "palm-jumeirah", "centro-the-villas", "promotions",
    "reviews-uae-dubai-abu-dhabi", "victory-heights---sports-city",
    "aluminium-windows-gulf-extrusion-tb600-tilt-and-turn-casement",
    "aluminium-door-cor-vision-4600-lift-and-slide",
    "alumnium-sliding-door-cor-vision-4700-lift-and-slide", "the-springs",
    "upvc-pvcu-casement-suite-windows-doors", "upvc-pvcu-sliding-window-door-suite",
    "palmara-2-arabian-ranches",
    # Extra pages from sitemap
    "about-us", "product-range", "projects", "aluminium-doors",
    "aluminium-windows", "aluminium-glass-curtain-wall-gazing-facade",
    "aluminium-bifolding-folding-doors-cortizo", "aluminium-windows-cortizo-casement",
    "aluminium-upvc-sliding-doors-windows", "aluminium-sliding-door-window-cortizo-4900",
    "aluminium-sliding-door-cor-vision-plus",
    "bi-fold-aluminium-profile-door-cortizo",
    "front-entrance-doors",
    "upvc-pvcu-windows-doors",
    "curtain-wall-facade-glazing-cortizo-tp52",
    "gulf-extrusion-tb600-door", "cortizo-aluminium-cor-70-industrial-window",
    "vetro-casement-windows-doors-aluminium", "vetro-slide-vetromax-aluminium-sliding-door",
    "vetromax-vetro-pivot-door", "vetromax-vf35-facade-glazing-curtain-wall-35mm",
    "premium-high-quality-garden-rooms-glass-conservatory",
    "skylights-and-rooflights", "insect-screens-fly-screens",
    "contact-us-aluminium-windows-doors", "enquire-get-a-quote",
    "showroom-visit-booking-form", "showroom-jebel-ali-aluminium-windows-doors",
    "our-showroom",
    "inspiration-Gallery-projects-abu-dhabi-dubai-ajman-sharjah-united-arab-emirates",
    "reviews-uae-dubai-abu-dhabi",
    "promotions", "resources",
    "arabian-ranches-dubai",
    "padel-x-project",
]


def url_to_alias(url: str) -> str:
    path = url.replace(SITE, "").strip("/")
    return path if path else "home"


def alias_to_dest(alias: str) -> Path:
    if alias == "home":
        return DIST / "index.html"
    return DIST / "pages" / f"{alias}.html"


# ── HTML rewriting ───────────────────────────────────────────────────────────

def rewrite_html(html: str, page_alias: str) -> str:
    depth = 0 if page_alias == "home" else 1
    prefix = "../" if depth > 0 else ""

    # Replace CDN URLs with local paths
    all_cdn = extract_cdn_urls(html)
    for cdn_url in sorted(all_cdn, key=len, reverse=True):  # longest first
        dist_rel = register_cdn_url(cdn_url)
        html = html.replace(cdn_url, f"{prefix}{dist_rel}")

    # Fix internal swiftrooms.ae navigation links
    def replace_link(m):
        full = m.group(1)
        base = full.split("#")[0].split("?")[0]
        anchor = ("#" + full.split("#", 1)[1]) if "#" in full else ""
        a = url_to_alias(base)
        if a == "home":
            return f'href="{prefix}index.html{anchor}"'
        return f'href="{prefix}pages/{a}.html{anchor}"'

    html = re.sub(r'href="(https://www\.swiftrooms\.ae[^"]*)"', replace_link, html)

    # Remove chrome-extension refs
    html = re.sub(r'src="chrome-extension://[^"]*"', 'src=""', html)
    # Disable service worker
    html = re.sub(r"navigator\.serviceWorker\.register\([^)]+\)", "Promise.resolve()", html)
    return html


def process_css(css_text: str) -> str:
    """Rewrite CDN URLs inside a CSS file to use ../../assets/ relative paths."""
    all_cdn = extract_cdn_urls(css_text)
    for cdn_url in sorted(all_cdn, key=len, reverse=True):
        dist_rel = register_cdn_url(cdn_url)
        local = f"../../{dist_rel}"  # relative from assets/css/
        css_text = css_text.replace(cdn_url, local)
    return css_text


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=== swiftrooms.ae full scrape ===\n")

    for d in ["assets/css", "assets/js", "assets/images", "assets/videos",
              "assets/fonts", "assets/embeds", "pages"]:
        (DIST / d).mkdir(parents=True, exist_ok=True)

    # ── 1: Discover pages ─────────────────────────────────────────────────
    print("[1/4] Discovering pages ...")
    all_urls = get_all_page_urls()
    print(f"      {len(all_urls)} pages to fetch\n")

    # ── 2: Fetch all pages ────────────────────────────────────────────────
    print("[2/4] Fetching pages ...")
    pages: dict[str, str] = {}
    for i, url in enumerate(all_urls, 1):
        alias = url_to_alias(url)
        status, body = curl_fetch(url)
        if status == 200:
            pages[alias] = body.decode("utf-8", errors="replace")
            print(f"  [{i:02}/{len(all_urls)}] OK  {alias}")
        else:
            print(f"  [{i:02}/{len(all_urls)}] {status} SKIP  {alias}")
        time.sleep(0.25)

    print(f"\n      {len(pages)} pages fetched\n")

    # ── 3: Register + download CDN assets ────────────────────────────────
    print("[3/4] Downloading CDN assets ...")

    # Collect from all pages
    for html in pages.values():
        for url in extract_cdn_urls(html):
            register_cdn_url(url)

    # Collect from existing local CSS
    for css_file in (DIST / "assets" / "css").glob("*.css"):
        try:
            txt = css_file.read_text(encoding="utf-8", errors="replace")
            for url in extract_cdn_urls(txt):
                register_cdn_url(url)
        except Exception:
            pass

    print(f"      {len(CDN_MAP)} assets registered")

    success = 0
    failed = []

    def dl(item):
        cdn_url, dist_rel = item
        dest = DIST / dist_rel
        ok = curl_download(cdn_url, dest)
        return cdn_url, ok

    with ThreadPoolExecutor(max_workers=6) as pool:
        futs = {pool.submit(dl, item): item for item in list(CDN_MAP.items())}
        for i, fut in enumerate(as_completed(futs), 1):
            url, ok = fut.result()
            name = Path(CDN_MAP[url]).name
            if ok:
                success += 1
                print(f"  [{i:03}/{len(CDN_MAP)}] OK   {name}")
            else:
                failed.append(url)
                print(f"  [{i:03}/{len(CDN_MAP)}] FAIL {name}")

    print(f"\n      {success}/{len(CDN_MAP)} downloaded, {len(failed)} failed\n")

    # Rewrite CDN URLs in existing local CSS files
    for css_file in (DIST / "assets" / "css").glob("*.css"):
        try:
            original = css_file.read_text(encoding="utf-8", errors="replace")
            updated = process_css(original)
            if updated != original:
                css_file.write_text(updated, encoding="utf-8")
                print(f"  CSS updated: {css_file.name}")
        except Exception:
            pass

    # ── 4: Write HTML pages ───────────────────────────────────────────────
    print("[4/4] Writing HTML pages ...")
    for alias, html in pages.items():
        html = rewrite_html(html, alias)
        dest = alias_to_dest(alias)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        print(f"  WRITE  {dest.relative_to(DIST)}")

    print(f"\n=== Complete ===")
    print(f"  Pages    : {len(pages)}")
    print(f"  Assets   : {success}/{len(CDN_MAP)}")
    print(f"  Output   : {DIST}")
    print(f"\nRun: cd dist && python3 -m http.server 8080")


if __name__ == "__main__":
    main()
