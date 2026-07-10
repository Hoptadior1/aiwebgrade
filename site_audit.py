#!/usr/bin/env python3
"""
Full site audit — run from the root of your aiwebgrade folder:
    python3 site_audit.py
"""
import re, os, glob, json
from difflib import SequenceMatcher

files = sorted(glob.glob('**/*.html', recursive=True))
print(f"\n{'='*60}\nFOUND {len(files)} HTML FILES (expected: 57)\n{'='*60}\n")

issues = []
titles = {}
descs = {}
word_counts = {}
main_texts = {}

for path in files:
    with open(path, encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. noindex check
    if 'noindex' in content.lower():
        issues.append(f"❌ NOINDEX found: {path}")

    # 2. canonical
    canon_count = len(re.findall(r'rel="canonical"', content))
    if canon_count != 1:
        issues.append(f"❌ {path}: {canon_count} canonical tags (need 1)")

    # 3. viewport
    if 'name="viewport"' not in content:
        issues.append(f"❌ {path}: missing viewport meta")

    # 4. lang
    if 'lang="en"' not in content:
        issues.append(f"❌ {path}: missing lang attribute")

    # 5. title length
    m = re.search(r'<title>(.*?)</title>', content)
    if m:
        t = m.group(1)
        titles[path] = t
        if len(t) > 65:
            issues.append(f"⚠️  {path}: title {len(t)} chars (over 65) — '{t[:50]}...'")
    else:
        issues.append(f"❌ {path}: NO TITLE TAG")

    # 6. meta description length
    m = re.search(r'name="description" content="([^"]*)"', content)
    if m:
        d = m.group(1)
        descs[path] = d
        if len(d) > 155:
            issues.append(f"⚠️  {path}: meta desc {len(d)} chars (over 155)")
    else:
        issues.append(f"❌ {path}: NO META DESCRIPTION")

    # 7. H1 count
    h1_count = len(re.findall(r'<h1', content))
    if h1_count != 1:
        issues.append(f"❌ {path}: {h1_count} H1 tags (need exactly 1)")

    # 8. schema validity (where present)
    schema_matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    for s in schema_matches:
        try:
            json.loads(s)
        except Exception as e:
            issues.append(f"❌ {path}: INVALID SCHEMA JSON — {e}")

    # 9. broken internal links (basic check against file list)
    links = re.findall(r'href="(/[^"]*)"', content)
    for link in links:
        clean = link.split('#')[0].split('?')[0]
        if clean in ('/', ''):
            continue
        target = clean.lstrip('/')
        if target.endswith('/'):
            target += 'index.html'
        elif not target.endswith('.html'):
            target += '/index.html'
        if not os.path.exists(target):
            issues.append(f"❌ BROKEN LINK in {path}: {link}")

    # word count for main content (article pages only)
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text).strip()
    words = len(text.split())
    word_counts[path] = words

    m2 = re.search(r'<article class="article-content">(.*?)</article>', content, re.DOTALL)
    if m2:
        t2 = re.sub(r'<[^>]+>', ' ', m2.group(1))
        main_texts[path] = re.sub(r'\s+', ' ', t2).strip()

# 10. duplicate titles/descriptions
seen_titles = {}
for path, t in titles.items():
    seen_titles.setdefault(t, []).append(path)
for t, paths in seen_titles.items():
    if len(paths) > 1:
        issues.append(f"❌ DUPLICATE TITLE '{t}': {paths}")

seen_descs = {}
for path, d in descs.items():
    seen_descs.setdefault(d, []).append(path)
for d, paths in seen_descs.items():
    if len(paths) > 1:
        issues.append(f"❌ DUPLICATE META DESC: {paths}")

# Print issues
if issues:
    print(f"⚠️  {len(issues)} ISSUES FOUND:\n")
    for i in issues:
        print(i)
else:
    print("✅ ZERO technical issues found across all pages")

# 11. Content uniqueness check (article pages only)
print(f"\n{'='*60}\nCONTENT UNIQUENESS CHECK ({len(main_texts)} article pages)\n{'='*60}")
paths_list = list(main_texts.keys())
max_sim = 0
max_pair = None
total_pairs = 0
sim_sum = 0
for i in range(len(paths_list)):
    for j in range(i+1, len(paths_list)):
        r = SequenceMatcher(None, main_texts[paths_list[i]], main_texts[paths_list[j]]).ratio()
        total_pairs += 1
        sim_sum += r
        if r > max_sim:
            max_sim = r
            max_pair = (paths_list[i], paths_list[j])

if total_pairs:
    print(f"Pairs checked: {total_pairs}")
    print(f"Average similarity: {sim_sum/total_pairs*100:.1f}%")
    print(f"Highest similarity: {max_sim*100:.1f}% ({max_pair[0]} vs {max_pair[1]})")
    print("Google doorway-risk threshold: 40% — " + ("✅ SAFE" if max_sim < 0.4 else "⚠️ REVIEW NEEDED"))

# 12. Word count summary
print(f"\n{'='*60}\nWORD COUNT SUMMARY\n{'='*60}")
article_wc = {p: w for p, w in word_counts.items() if p in main_texts}
if article_wc:
    avg = sum(article_wc.values()) / len(article_wc)
    print(f"Article pages: {len(article_wc)} | avg total words: {avg:.0f}")
    low = [p for p, w in article_wc.items() if w < 900]
    if low:
        print(f"Pages under 900 total words: {len(low)}")
        for p in low:
            print(f"  {p}: {word_counts[p]}w")

print(f"\n{'='*60}\nDONE\n{'='*60}\n")