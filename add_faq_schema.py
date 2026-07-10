#!/usr/bin/env python3
"""
Adds FAQPage schema to every page that has a "Common questions" section.
Run from the root of your aiwebgrade folder:
    python3 add_faq_schema.py
"""
import re, glob, html

files = glob.glob('**/*.html', recursive=True)
updated = 0
skipped_no_faq = []
skipped_has_schema = []

for path in files:
    with open(path, encoding='utf-8') as f:
        content = f.read()

    if 'FAQPage' in content:
        skipped_has_schema.append(path)
        continue

    section = re.search(r'<h2>Common questions[^<]*</h2>(.*?)<div class="article-cta">', content, re.DOTALL)
    if not section:
        skipped_no_faq.append(path)
        continue

    qa_pairs = re.findall(r'<h3>(.*?)</h3>\s*<p>(.*?)</p>', section.group(1), re.DOTALL)
    if not qa_pairs:
        skipped_no_faq.append(path)
        continue

    def clean(text):
        text = re.sub(r'<[^>]+>', '', text)  # strip any inner tags
        text = html.unescape(text).strip()
        text = text.replace('"', '\\"')
        return text

    faq_items = []
    for q, a in qa_pairs:
        faq_items.append({
            "@type": "Question",
            "name": clean(q),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": clean(a)
            }
        })

    import json
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq_items
    }
    schema_json = json.dumps(faq_schema)
    schema_tag = f'<script type="application/ld+json">{schema_json}</script>\n</head>'

    if '</head>' not in content:
        skipped_no_faq.append(f"{path} (no </head> tag)")
        continue

    new_content = content.replace('</head>', schema_tag, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    updated += 1

print(f"\n{'='*50}")
print(f"FAQ SCHEMA ADDED TO {updated} PAGES")
print(f"{'='*50}")
if skipped_has_schema:
    print(f"\nAlready had FAQ schema (skipped): {len(skipped_has_schema)}")
if skipped_no_faq:
    print(f"\nNo 'Common questions' section found (skipped): {len(skipped_no_faq)}")
    for p in skipped_no_faq:
        print(f"  - {p}")