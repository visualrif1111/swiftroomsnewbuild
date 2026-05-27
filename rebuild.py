#!/usr/bin/env python3
"""
Rebuild script for swiftrooms.ae local static clone.
Creates clean dist/ directory from saved Chrome pages.
"""

import os
import re
import shutil
from pathlib import Path

SRC = Path("/Users/ariftariq/Downloads/swiftrooms-clone")
DIST = SRC / "dist"

# ── URL alias → HTML filename mapping ──────────────────────────────────────
PAGE_MAP = {
    "home": "Aluminium Doors and Windows Dubai _ Swiftrooms.html",
    "4900-gallery": "4900 Swiftrooms _ Explore Our Inspiration Gallery.html",
    "al-barari": "Al Barari Villa Project Dubai UAE.html",
    "aluminium-sliding-door-cor-vision": "Aluminium CorVision Sliding Doors _ Swiftrooms, Dubai.html",
    "front-entrance-doors-aluminium-paneled-glass-upvc": "Aluminium Front Entrance Doors, Dubai.html",
    "aluminium-sliding-door-window-gulf-extrusion-al-ghurair-montana": "Aluminium Sliding Door Window Gulf Extrusion_SwiftRooms.html",
    "aluminium-windows-cortizo-alu-steel-classic-and-modern": "Aluminium Steel Windows _ Swiftrooms, Dubai.html",
    "aluminium-windows-cortizo-cor-70-hidden-sash": "Aluminium Windows Cortizo Cor 70 Hidden Sash, Dubai.html",
    "bi-fold-aluminium-profile-door-cortizo": "Bi-fold Doors _ Cortizo Swiftrooms , Dubai.html",
    "monty-s-montgomery-golf-course": "Commercials Glass room _ Swiftrooms _ UAE.html",
    "cortizo-cor-70-door": "Cor 70 Door Swiftrooms _ Doors, Dubai.html",
    "cor-vision-plus": "Cor Plus Swiftrooms _ Explore Our Inspiration Gallery.html",
    "cor-vision-gallery": "Cor Vision Swiftrooms _ Explore Our Inspiration Gallery.html",
    "curtain-wall-facade-glazing-cortizo-tp52-equity": "Curtain Wall Cortizo TP52 Equity _ Swiftrooms _ Dubai.html",
    "curtain-wall-facade-glazing-cortizo-tp52": "Curtain Wall Facade Cortizo TP52 _ Swiftrooms _ UAE.html",
    "curtain-wall-facade-gulf-extrusion-alghurair-cw-50mm": "Curtain Wall Glazing GulfEx Systems _ Swiftrooms _ UAE.html",
    "brookfields---damac-hills---dubai": "Damac Hills Brookfields Villa renovation.html",
    "phoenix-damac-hills": "Damac hills & Window Systems _ Swiftrooms _ UAE.html",
    "emirates-hills": "Emirates Hills Project Windows _ Swiftrooms _ UAE.html",
    "jumeirah-village-triangle-district-5": "Garden Room & Window Systems _ Swiftrooms _ UAE.html",
    "glass-room-abu-dhabi": "Garden Rooms & Window Systems _ Swiftrooms _ UAE.html",
    "phileas-fogg---dubai": "Garden Rooms & Windows _ Swiftrooms _ Dubai.html",
    "palm-jumeirah": "Palm Jumeirah Project in Dubai UAE.html",
    "centro-the-villas": "Premium Garden Rooms & Windows _ Swiftrooms _ UAE.html",
    "promotions": "Promotions, Windows & Doors _ Swiftrooms _ UAE.html",
    "reviews-uae-dubai-abu-dhabi": "Reviews, Garden Room & Window Systems _ UAE.html",
    "victory-heights---sports-city": "Sports City Window Systems _ Swiftrooms _ UAE.html",
    "aluminium-windows-gulf-extrusion-tb600-tilt-and-turn-casement": "Swiftrooms Gulf Extrusion TB600 Aluminium Window, Dxb.html",
    "aluminium-door-cor-vision-4600-lift-and-slide": "Swiftrooms _ Cor Vision 4600 Lift & Slide Sliding Doors.html",
    "alumnium-sliding-door-cor-vision-4700-lift-and-slide": "Swiftrooms _ Cor Vision 4700 Lift & Slide Sliding Doors.html",
    "the-springs": "The Springs, Windows & Doors _ Swiftrooms _ UAE.html",
    "upvc-pvcu-casement-suite-windows-doors": "UPVC PVCu Casement Windows _ Swift Rooms, Dubai.html",
    "upvc-pvcu-sliding-window-door-suite": "UPVC PVCu Sliding Windows _ Swift Rooms, Dubai.html",
    "palmara-2-arabian-ranches": "arabian ranches, Windows & Doors _ Swiftrooms _ UAE.html",
}

# ── Asset rename map (original name → new clean name) ──────────────────────
ASSET_RENAME = {
    "css2": "google-fonts.css",
    "css2(1)": "google-fonts-1.css",
    "css2(2)": "google-fonts-2.css",
    "js": "google-analytics.js",
    "m=root,base": "youtube-base.js",
    "2707428446134977": "facebook-pixel.js",
    "rs=AGKMywFEHEdu2_-wpfnrSURanlgN_XdDhw": "youtube-embed-ui.css",
}

# ── Determine asset subfolder by filename ──────────────────────────────────
CSS_EXTS = {".css"}
JS_EXTS = {".js"}
IMG_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"}
EMBED_EXTS = {".html"}

def asset_subfolder(name: str) -> str | None:
    """Return subfolder under assets/ for a given filename, or None to skip."""
    if name in ("tr", "saved_resource.html", "ad_status.js"):
        return None  # tracking pixels / empty files – skip
    renamed = ASSET_RENAME.get(name, name)
    ext = Path(renamed).suffix.lower()
    if ext in CSS_EXTS or renamed.endswith(".css"):
        return "css"
    if ext in JS_EXTS or renamed.endswith(".js"):
        return "js"
    if ext in IMG_EXTS:
        return "images"
    if ext in EMBED_EXTS:
        return "embeds"
    # Files without extension – check content later; default to js-like
    return "js"


def collect_assets():
    """Walk all _files folders and copy unique assets to dist/assets/."""
    copied = {}  # original_name → dist_path (relative to dist/)
    for files_dir in sorted(SRC.glob("*_files")):
        for asset in sorted(files_dir.iterdir()):
            if not asset.is_file():
                continue
            orig_name = asset.name
            subfolder = asset_subfolder(orig_name)
            if subfolder is None:
                continue
            clean_name = ASSET_RENAME.get(orig_name, orig_name)
            dest_rel = f"assets/{subfolder}/{clean_name}"
            dest_abs = DIST / dest_rel
            dest_abs.parent.mkdir(parents=True, exist_ok=True)
            if orig_name not in copied:
                shutil.copy2(asset, dest_abs)
                copied[orig_name] = dest_rel
                print(f"  COPY  {orig_name}  →  {dest_rel}")
            # else: already copied, skip duplicate
    return copied  # maps original_name → assets/subdir/clean_name


def build_internal_link_map(depth: int) -> dict[str, str]:
    """Build https://www.swiftrooms.ae/{alias} → local relative path."""
    prefix = "../" if depth > 0 else ""
    links = {}
    links["https://www.swiftrooms.ae/"] = f"{prefix}index.html"
    links["https://www.swiftrooms.ae"] = f"{prefix}index.html"
    links["https://www.swiftrooms.ae/#"] = f"{prefix}index.html#"
    for alias in PAGE_MAP:
        if alias == "home":
            continue
        local = f"{prefix}pages/{alias}.html"
        links[f"https://www.swiftrooms.ae/{alias}"] = local
        # URL-encoded variants with %2D
        links[f"https://www.swiftrooms.ae/{alias.replace('---', '-%2D%2D-')}"] = local
    return links


def fix_html(content: str, files_folder_name: str, asset_map: dict, depth: int) -> str:
    """Rewrite all asset paths and internal links in an HTML file."""
    import html as html_module
    prefix = "../" if depth > 0 else ""

    # Build list of folder name variants: plain and HTML-encoded (& → &amp;)
    folder_variants = [files_folder_name]
    html_encoded = html_module.escape(files_folder_name)
    if html_encoded != files_folder_name:
        folder_variants.append(html_encoded)

    def replace_asset_ref(m):
        quote = m.group(1)
        fname = m.group(2)
        # Decode any HTML entities in the filename
        fname = html_module.unescape(fname)
        subfolder = asset_subfolder(fname)
        if subfolder is None:
            return f'{quote}{quote}'  # remove broken ref
        clean = ASSET_RENAME.get(fname, fname)
        return f'{quote}{prefix}assets/{subfolder}/{clean}{quote}'

    def replace_url_ref(m):
        fname = html_module.unescape(m.group(1))
        subfolder = asset_subfolder(fname)
        if subfolder is None:
            return "url('')"
        clean = ASSET_RENAME.get(fname, fname)
        return f'url("{prefix}assets/{subfolder}/{clean}")'

    for folder_name in folder_variants:
        escaped_folder = re.escape(folder_name)
        # Handle quoted references: href="./Folder_files/file" or src="./Folder_files/file"
        pattern = rf'(["\'])\./{escaped_folder}/([^"\']+)\1'
        content = re.sub(pattern, replace_asset_ref, content)
        # Handle url(./Folder_files/file) in style attributes
        url_pattern = rf'url\(\./{escaped_folder}/([^)]+)\)'
        content = re.sub(url_pattern, replace_url_ref, content)

    # Fix internal navigation links
    internal_links = build_internal_link_map(depth)

    def replace_link(m):
        full_url = m.group(1)
        # Try exact match first
        if full_url in internal_links:
            return f'href="{internal_links[full_url]}"'
        # Try with anchor
        if "#" in full_url:
            base, anchor = full_url.split("#", 1)
            if base in internal_links:
                return f'href="{internal_links[base]}#{anchor}"'
            # strip swiftrooms.ae prefix and check alias
            path = base.replace("https://www.swiftrooms.ae/", "")
            for alias, local in internal_links.items():
                if alias.endswith(path):
                    return f'href="{local}#{anchor}"'
        # Strip URL to get alias
        path = full_url.replace("https://www.swiftrooms.ae/", "").rstrip("/")
        if path in internal_links:
            return f'href="{internal_links[path]}"'
        # URL-decoded comparison
        import urllib.parse
        decoded = urllib.parse.unquote(path)
        for alias in PAGE_MAP:
            if decoded == alias or path == alias:
                if alias == "home":
                    return f'href="{prefix}index.html"'
                return f'href="{prefix}pages/{alias}.html"'
        # Link to a page we don't have saved – keep as external
        return f'href="{full_url}"'

    content = re.sub(
        r'href="(https://www\.swiftrooms\.ae[^"]*)"',
        replace_link,
        content
    )

    # Remove chrome-extension references
    content = re.sub(r'src="chrome-extension://[^"]*"', 'src=""', content)

    # Remove service worker registration (won't work locally)
    content = re.sub(
        r"navigator\.serviceWorker\.register\([^)]+\)",
        "Promise.resolve()",
        content
    )

    return content


def process_pages(asset_map: dict):
    """Process each HTML page and write to dist/."""
    for alias, src_filename in PAGE_MAP.items():
        src_path = SRC / src_filename
        if not src_path.exists():
            print(f"  WARN  missing source: {src_filename}")
            continue

        files_folder = src_filename.replace(".html", "_files")
        depth = 0 if alias == "home" else 1

        content = src_path.read_text(encoding="utf-8", errors="replace")
        content = fix_html(content, files_folder, asset_map, depth)

        if alias == "home":
            dest = DIST / "index.html"
        else:
            dest = DIST / "pages" / f"{alias}.html"

        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(content, encoding="utf-8")
        print(f"  PAGE  {alias}  →  {dest.relative_to(DIST)}")


def write_readme():
    readme = DIST / "README.md"
    readme.write_text(
        "# Swiftrooms AE — Local Static Clone\n\n"
        "## Running locally\n\n"
        "```bash\n"
        "cd dist\n"
        "python3 -m http.server 8080\n"
        "```\n\n"
        "Then open http://localhost:8080 in your browser.\n\n"
        "## Structure\n\n"
        "```\n"
        "dist/\n"
        "  index.html          # Home page (swiftrooms.ae/)\n"
        "  pages/              # All other pages by URL alias\n"
        "  assets/\n"
        "    css/              # Stylesheets\n"
        "    js/               # JavaScript\n"
        "    images/           # Images, SVGs\n"
        "    embeds/           # YouTube embed HTML stubs\n"
        "```\n\n"
        "## Pages included\n\n"
        + "\n".join(
            f"- `pages/{alias}.html` — {filename.replace('.html','')}"
            for alias, filename in PAGE_MAP.items()
            if alias != "home"
        )
        + "\n",
        encoding="utf-8",
    )
    print("  README written")


def main():
    print("=== Swiftrooms clone rebuild ===\n")

    if DIST.exists():
        print(f"Removing existing dist/ ...")
        shutil.rmtree(DIST)

    # Create directory skeleton
    for d in ["assets/css", "assets/js", "assets/images", "assets/embeds", "pages"]:
        (DIST / d).mkdir(parents=True, exist_ok=True)

    print("\n[1/3] Collecting assets ...")
    asset_map = collect_assets()
    print(f"      {len(asset_map)} unique assets copied\n")

    print("[2/3] Processing HTML pages ...")
    process_pages(asset_map)
    print()

    print("[3/3] Writing README ...")
    write_readme()

    print("\n=== Done! ===")
    print(f"Output: {DIST}")
    print("Run:    cd dist && python3 -m http.server 8080")


if __name__ == "__main__":
    main()
