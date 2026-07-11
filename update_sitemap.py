#!/usr/bin/env python3
"""
update_sitemap.py — Auto-generates sitemap.xml for aiwebgrade.com

Scans the site's actual folders and builds sitemap.xml from whatever
HTML files exist right now — no manual list-keeping required.

USAGE:
    Run from the root of your aiwebgrade repo (same folder as index.html):
    python3 update_sitemap.py

    Then commit the updated sitemap.xml as usual:
    git add sitemap.xml
    git commit -m "Update sitemap"
    git push

RULES (matches your existing sitemap.xml conventions):
    /                       -> priority 1.0, changefreq weekly
    /blog/  (index)         -> priority 0.9, changefreq weekly
    /industry/ (index)      -> priority 0.9, changefreq monthly
    /city/ (index)          -> priority 0.9, changefreq monthly
    /blog/*.html            -> priority 0.8, changefreq monthly
    /industry/*.html        -> priority 0.7, changefreq monthly
    /city/*.html            -> priority 0.7, changefreq monthly
    /combo/*.html (if exists) -> priority 0.6, changefreq monthly

Files that are auto-excluded: anything starting with "_", any file
literally named "index.html" inside a folder is treated as that
folder's own index entry (already covered above), and non-.html files.
"""

import os
from pathlib import Path
from xml.sax.saxutils import escape

DOMAIN = "https://www.aiwebgrade.com"
ROOT = Path(__file__).resolve().parent

# folder -> (priority for pages inside it, changefreq for pages inside it,
#            index priority, index changefreq)
FOLDER_RULES = {
    "blog":     {"page_priority": "0.8", "page_freq": "monthly", "index_priority": "0.9", "index_freq": "weekly"},
    "industry": {"page_priority": "0.7", "page_freq": "monthly", "index_priority": "0.9", "index_freq": "monthly"},
    "city":     {"page_priority": "0.7", "page_freq": "monthly", "index_priority": "0.9", "index_freq": "monthly"},
    "combo":    {"page_priority": "0.6", "page_freq": "monthly", "index_priority": "0.7", "index_freq": "monthly"},
}

EXCLUDE_PREFIXES = ("_", ".")
EXCLUDE_FILES = {"404.html"}


def collect_urls():
    urls = []

    # Homepage
    if (ROOT / "index.html").exists():
        urls.append({
            "loc": f"{DOMAIN}/",
            "changefreq": "weekly",
            "priority": "1.0",
        })

    # Each known content folder
    for folder, rules in FOLDER_RULES.items():
        folder_path = ROOT / folder
        if not folder_path.is_dir():
            continue

        # Index page for the folder (e.g. /blog/)
        if (folder_path / "index.html").exists():
            urls.append({
                "loc": f"{DOMAIN}/{folder}/",
                "changefreq": rules["index_freq"],
                "priority": rules["index_priority"],
            })

        # Individual pages inside the folder
        for html_file in sorted(folder_path.glob("*.html")):
            name = html_file.name
            if name == "index.html":
                continue
            if name in EXCLUDE_FILES or name.startswith(EXCLUDE_PREFIXES):
                continue
            urls.append({
                "loc": f"{DOMAIN}/{folder}/{name}",
                "changefreq": rules["page_freq"],
                "priority": rules["page_priority"],
            })

    return urls


def build_sitemap_xml(urls):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', '']

    # Group with comments for readability, same style as the hand-built version.
    # Index pages are identified by a trailing slash (e.g. /blog/) — NOT by
    # slash count, since "/blog/" and "/blog/post.html" both contain 4 slashes.
    homepage = [u for u in urls if u["loc"] == f"{DOMAIN}/"]
    indexes = [u for u in urls if u["loc"].endswith("/") and u["loc"] != f"{DOMAIN}/"]
    index_locs = {i["loc"] for i in indexes}
    blog_pages = [u for u in urls if u["loc"].startswith(f"{DOMAIN}/blog/") and u["loc"] not in index_locs]
    industry_pages = [u for u in urls if u["loc"].startswith(f"{DOMAIN}/industry/") and u["loc"] not in index_locs]
    city_pages = [u for u in urls if u["loc"].startswith(f"{DOMAIN}/city/") and u["loc"] not in index_locs]
    combo_pages = [u for u in urls if u["loc"].startswith(f"{DOMAIN}/combo/") and u["loc"] not in index_locs]

    def emit(label, entries):
        if not entries:
            return
        lines.append(f"<!-- {label} -->")
        for u in entries:
            lines.append(
                f'<url><loc>{escape(u["loc"])}</loc>'
                f'<changefreq>{u["changefreq"]}</changefreq>'
                f'<priority>{u["priority"]}</priority></url>'
            )
        lines.append("")

    emit("Homepage", homepage)
    emit("Index pages", indexes)
    emit("Blog posts", blog_pages)
    emit("Industry pages", industry_pages)
    emit("City pages", city_pages)
    emit("Combo pages", combo_pages)

    lines.append("</urlset>")
    return "\n".join(lines)


def main():
    urls = collect_urls()
    if not urls:
        print("No HTML files found. Make sure you're running this from the aiwebgrade repo root.")
        return

    xml = build_sitemap_xml(urls)
    out_path = ROOT / "sitemap.xml"
    out_path.write_text(xml, encoding="utf-8")

    print(f"sitemap.xml updated — {len(urls)} URLs written to {out_path}")
    print("Now run:")
    print("  git add sitemap.xml")
    print('  git commit -m "Update sitemap"')
    print("  git push")


if __name__ == "__main__":
    main()