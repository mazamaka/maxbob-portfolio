"""Generate crawlable public pages and discovery files from reviewed catalog data."""
from pathlib import Path
from collections import defaultdict
from html import escape
import json
from site_metadata import SITE, TITLE, DESCRIPTION, graph, metadata, replace_metadata, shared_layout

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
projects = json.loads((ROOT / 'src/catalog.json').read_text())['projects']
cases = json.loads((ROOT / 'src/case-studies.json').read_text())['cases']
source = (DIST / 'index.html').read_text()
source = replace_metadata(source, metadata(data=graph('/', TITLE, DESCRIPTION, 'ProfilePage')))
(DIST / 'index.html').write_text(source)
head = source[source.index('<head>'):source.index('</head>') + 7]
header = source[source.index('<header'):source.index('</header>') + 9]
footer = source[source.index('<footer'):source.index('</footer>') + 9]

title = 'Project Directory — AI, Automation & Python | MaxBob'
description = 'Browse Maksym Babenko’s AI, Python, browser automation and infrastructure projects: public source code, engineering case studies and private-work overviews.'
items = [{'@type': 'ListItem', 'position': n, 'name': p['title'], 'url': SITE + '/projects/#' + p['id']}
         for n, p in enumerate(projects, 1)]
data = graph('/projects/', title, description, 'CollectionPage',
             {'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(items), 'itemListElement': items}})
h = shared_layout(replace_metadata(head, metadata('/projects/', title, description, data=data)), '../')
h = h.replace('</head>', '<link rel="stylesheet" href="/directory.css?v=1"></head>')
groups = defaultdict(list)
for p in projects:
    groups[p['category']].append(p)
sections, contents = [], []
case_links = {case['projectId']: case['slug'] for case in cases}
for index, (category, entries) in enumerate(groups.items(), 1):
    group_id = f'category-{index}'
    contents.append(f'<a href="#{group_id}">{escape(category)} <span>{len(entries)}</span></a>')
    cards = []
    for p in entries:
        details = ''.join('<li>' + escape(line) + '</li>' for line in p.get('searchContent', []))
        tags = ''.join('<li>' + escape(tag) + '</li>' for tag in p['tags'])
        public = p['visibility'] == 'public'
        links = ''
        if public and p.get('href'):
            links += f'<a href="{escape(p["href"], quote=True)}" target="_blank" rel="noopener noreferrer">View public repository ↗</a>'
        if p['id'] in case_links:
            label = 'Read case study' if public else 'Project overview'
            links += f'<a href="/cases/{case_links[p["id"]]}/">{label} →</a>'
        note = 'Public source' if public else 'Private project · overview only'
        cards.append(f'''<article class="directory-entry" id="{escape(p['id'], quote=True)}">
<div class="directory-entry-top"><h3>{escape(p['title'])}</h3><span>{note}</span></div>
<p>{escape(p['description'])}</p><ul class="directory-details">{details}</ul>
<ul class="directory-tags" aria-label="Technologies">{tags}</ul><div class="directory-links">{links}</div></article>''')
    sections.append(f'<section class="directory-group" id="{group_id}"><h2>{escape(category)}</h2>{"".join(cards)}</section>')

html = f'''<!doctype html><html lang="en" data-theme="light">{h}<body class="case-page directory-page">
<a class="skip" href="#directory">Skip to project directory</a>{shared_layout(header, '../')}
<main class="wrap directory-main" id="top"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>Project directory</span></nav>
<section class="directory-intro"><p class="workshop-eyebrow">THE PROJECT DIRECTORY</p><h1>Systems, tools<br>and <em>working code.</em></h1>
<p>AI agents, browser engineering, automation and infrastructure by Maksym Babenko. Explore public repositories and reviewed overviews of private work.</p>
<div class="directory-intro-links"><a class="button-primary" href="/#work">Search projects interactively →</a><a class="text-link" href="/assets/Maksym-Babenko-CV.pdf?v=20261005">Download CV</a></div></section>
<nav class="directory-contents" aria-label="Project categories">{''.join(contents)}</nav><div id="directory">{''.join(sections)}</div>
</main>{shared_layout(footer, '../')}</body></html>'''
(DIST / 'projects').mkdir(exist_ok=True)
(DIST / 'projects/index.html').write_text(html)

paths = ['/', '/projects/'] + ['/cases/' + case['slug'] + '/' for case in cases]
(DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '\n'.join(f'<url><loc>{SITE}{path}</loc></url>' for path in paths) + '\n</urlset>\n')
# Existing allow-all policy retained: public search/social crawlers can read the same pages as visitors.
(DIST / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n')
llms = ['# MaxBob — Maksym Babenko', '', '> Senior AI & Automation Engineer with 8+ years in software. AI agents, MCP tools, browser automation, antifraud and Python systems.', '',
        'This index describes the public portfolio. Private work is represented only by reviewed public summaries; private source code is not published here.', '', '## Portfolio', '',
        f'- [Profile and experience]({SITE}/): Background, selected projects, expertise and contact links.',
        f'- [Complete project directory]({SITE}/projects/): Readable HTML with project capabilities, technologies and public source links.',
        f'- [CV PDF]({SITE}/assets/Maksym-Babenko-CV.pdf): Professional experience, project selection and clickable links.', '', '## Engineering cases', '',
        *[f'- [{case["name"]}]({SITE}/cases/{case["slug"]}/): {case["description"]}' for case in cases], '', '## Public profiles', '',
        '- [GitHub](https://github.com/mazamaka)', '- [LinkedIn](https://www.linkedin.com/in/max-bob-python/)', '']
(DIST / 'llms.txt').write_text('\n'.join(llms))
print(f'Built shared SEO, directory with {len(projects)} reviewed projects, sitemap and llms.txt')
