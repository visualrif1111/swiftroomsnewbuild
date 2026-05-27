#!/usr/bin/env python3
"""
Patch all dist/ HTML files to download and localise:
 - static.cdn-website.com  (framework JS, CSS, fonts)
 - use.fontawesome.com      (Font Awesome CSS + webfonts)
 - rtc.multiscreensite.com  (chat widget)
"""

import re
import subprocess
import hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

DIST = Path("/Users/ariftariq/Downloads/swiftrooms-clone/dist")
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

# ── URL → local filename rules ───────────────────────────────────────────────

def url_to_local(url: str) -> tuple[str, str]:
    """Return (subfolder, filename) for a URL under assets/."""
    clean = url.split("?")[0].split("#")[0]
    h = hashlib.md5(url.encode()).hexdigest()[:8]
    name = clean.split("/")[-1] or "asset"
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""

    if ext in ("css",):
        return "css", f"{name.rsplit('.',1)[0]}-{h}.css"
    if ext in ("js",):
        return "js", f"{name.rsplit('.',1)[0]}-{h}.js"
    if ext in ("woff2",):
        return "fonts", f"{name.rsplit('.',1)[0]}-{h}.woff2"
    if ext in ("woff",):
        return "fonts", f"{name.rsplit('.',1)[0]}-{h}.woff"
    if ext in ("ttf",):
        return "fonts", f"{name.rsplit('.',1)[0]}-{h}.ttf"
    if ext in ("eot",):
        return "fonts", f"{name.rsplit('.',1)[0]}-{h}.eot"
    if ext in ("svg",):
        # Could be icon font or image
        if "font" in clean.lower() or "icon" in clean.lower():
            return "fonts", f"{name.rsplit('.',1)[0]}-{h}.svg"
        return "images", f"{name.rsplit('.',1)[0]}-{h}.svg"
    return "js", f"asset-{h}"


def download_url(url: str) -> tuple[str, Path | None]:
    """Download url, return (url, local_path) or (url, None) on failure."""
    clean_url = url.split("?")[0].split("#")[0]  # strip query/fragment for download
    subfolder, fname = url_to_local(url)
    dest = DIST / "assets" / subfolder / fname
    if dest.exists() and dest.stat().st_size > 0:
        return url, dest

    dest.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["curl", "-s", "-L", "--compressed", "-A", UA,
         "--max-time", "20", "-o", str(dest), clean_url],
        capture_output=True, timeout=25
    )
    if dest.exists() and dest.stat().st_size > 0:
        return url, dest
    return url, None


# ── Collect all external URLs that need localising ───────────────────────────

TARGET_DOMAINS = [
    "static.cdn-website.com",
    "use.fontawesome.com",
]

def extract_target_urls(text: str) -> set[str]:
    urls = set()
    for domain in TARGET_DOMAINS:
        for m in re.findall(rf'https?://{re.escape(domain)}[^\s"\'<>()]+', text):
            m = m.rstrip("'),;\".")
            # Normalise — keep the clean base URL (strip query/fragment variants)
            urls.add(m)
    return urls


def clean_font_url(url: str) -> str:
    """Strip query and fragment from font URLs for comparison."""
    return url.split("?")[0].split("#")[0]


def collect_all_urls(html_files: list[Path]) -> set[str]:
    all_urls: set[str] = set()
    for f in html_files:
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
            all_urls |= extract_target_urls(text)
        except Exception:
            pass
    # Also scan existing CSS for font URLs
    for css_file in (DIST / "assets" / "css").glob("*.css"):
        try:
            text = css_file.read_text(encoding="utf-8", errors="replace")
            all_urls |= extract_target_urls(text)
        except Exception:
            pass
    return all_urls


# ── Rewrite HTML/CSS files ───────────────────────────────────────────────────

def rewrite_file(path: Path, url_map: dict[str, str], is_css: bool = False):
    """Replace external URLs with local paths in a file."""
    try:
        original = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return

    updated = original
    for ext_url, local_rel in sorted(url_map.items(), key=lambda x: len(x[0]), reverse=True):
        if ext_url not in updated:
            continue
        if is_css:
            # From assets/css/, paths go up two levels
            local_path = f"../../{local_rel}"
        else:
            # Figure out depth from path
            rel = path.relative_to(DIST)
            depth = len(rel.parts) - 1  # 0 for index.html, 1 for pages/*.html
            prefix = "../" * depth
            local_path = f"{prefix}{local_rel}"
        updated = updated.replace(ext_url, local_path)

    if updated != original:
        path.write_text(updated, encoding="utf-8")


def main():
    print("=== Patching static.cdn-website.com + fontawesome ===\n")

    html_files = [DIST / "index.html"] + list((DIST / "pages").glob("*.html"))
    print(f"  Scanning {len(html_files)} HTML files ...")

    all_urls = collect_all_urls(html_files)
    print(f"  Found {len(all_urls)} external URLs to localise\n")

    # Download all assets
    print("Downloading assets ...")
    url_to_path: dict[str, Path] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futs = {pool.submit(download_url, u): u for u in all_urls}
        for i, fut in enumerate(as_completed(futs), 1):
            url, dest = fut.result()
            if dest:
                url_to_path[url] = dest
                print(f"  [{i:03}/{len(all_urls)}] OK   {dest.name}")
            else:
                print(f"  [{i:03}/{len(all_urls)}] FAIL {url[:80]}")

    # Build replacement map: external URL → dist-relative path
    url_map: dict[str, str] = {}
    for url, dest in url_to_path.items():
        rel = dest.relative_to(DIST).as_posix()
        url_map[url] = rel

    print(f"\n  {len(url_map)} assets ready\n")

    # Handle font URLs with query strings: multiple variants may map to same file
    # e.g. url.ttf?5f0fg  and  url.ttf  both should → same local file
    # Build a secondary map: clean_url → local_rel
    clean_map: dict[str, str] = {}
    for url, rel in url_map.items():
        clean = clean_font_url(url)
        if clean not in clean_map:
            clean_map[clean] = rel

    # Merge: for any URL not already mapped, try clean version
    full_map = dict(url_map)
    for url in all_urls:
        if url not in full_map:
            clean = clean_font_url(url)
            if clean in clean_map:
                full_map[url] = clean_map[clean]

    # Patch HTML files
    print("Patching HTML files ...")
    for f in html_files:
        rewrite_file(f, full_map, is_css=False)
    print(f"  {len(html_files)} HTML files patched")

    # Patch local CSS files
    print("Patching CSS files ...")
    css_files = list((DIST / "assets" / "css").glob("*.css"))
    for f in css_files:
        rewrite_file(f, full_map, is_css=True)
    print(f"  {len(css_files)} CSS files patched")

    # Verify: check how many external refs remain in index.html
    remaining = extract_target_urls(
        (DIST / "index.html").read_text(encoding="utf-8", errors="replace")
    )
    print(f"\n  Remaining external refs in index.html: {len(remaining)}")
    for u in sorted(remaining):
        print(f"    {u[:100]}")

    print("\n=== Done — restart server and reload ===")


if __name__ == "__main__":
    main()
