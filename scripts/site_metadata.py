"""Shared metadata for the static portfolio and its case studies."""
from html import escape
import json
import re

SITE = 'https://cv.maxbob.xyz'
NAME = 'Maksym Babenko'
TITLE = 'Maksym Babenko — Senior AI & Automation Engineer | MaxBob'
DESCRIPTION = 'Senior AI & Automation Engineer with 8+ years in software. Explore AI agents, MCP tools, browser automation, antifraud engineering and Python projects.'
START, END = '<!-- SEO:START -->', '<!-- SEO:END -->'


def identity():
    return [
        {'@type': 'Person', '@id': SITE + '/#person', 'name': NAME,
         'alternateName': ['MaxBob', 'mazamaka'], 'url': SITE + '/',
         'jobTitle': 'Senior AI & Automation Engineer',
         'description': DESCRIPTION,
         'sameAs': ['https://github.com/mazamaka', 'https://www.linkedin.com/in/max-bob-python/'],
         'knowsAbout': ['AI agents', 'Model Context Protocol', 'Python', 'Browser automation',
                       'Browser fingerprinting', 'Antifraud engineering', 'FastAPI', 'DevOps']},
        {'@type': 'WebSite', '@id': SITE + '/#website', 'url': SITE + '/',
         'name': 'MaxBob', 'alternateName': 'Maksym Babenko Portfolio',
         'description': DESCRIPTION, 'inLanguage': 'en', 'publisher': {'@id': SITE + '/#person'}},
    ]


def graph(path, title, description, page_type='WebPage', extra=None):
    page = {'@type': page_type, '@id': SITE + path + '#webpage', 'url': SITE + path,
            'name': title, 'description': description, 'inLanguage': 'en',
            'isPartOf': {'@id': SITE + '/#website'}, 'about': {'@id': SITE + '/#person'},
            'author': {'@id': SITE + '/#person'}}
    if page_type == 'ProfilePage':
        page['mainEntity'] = {'@id': SITE + '/#person'}
    if extra:
        page.update(extra)
    return {'@context': 'https://schema.org', '@graph': identity() + [page]}


def metadata(path='/', title=TITLE, description=DESCRIPTION, image='maxbob-v2.jpg',
             image_alt='MaxBob — Maksym Babenko, Senior AI & Automation Engineer. AI agents, automation and browser engineering.',
             data=None):
    url, image_url = SITE + path, SITE + '/assets/social/' + image
    rows = [START, '<title>' + escape(title) + '</title>']
    for key, value in [('description', description), ('author', NAME),
                       ('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'),
                       ('color-scheme', 'light dark'), ('theme-color', '#f9f7ef')]:
        rows.append(f'<meta name="{key}" content="{escape(value, quote=True)}">')
    rows.append(f'<link rel="canonical" href="{url}">')
    for key, value in [('type', 'website'), ('site_name', 'MaxBob'), ('locale', 'en_US'),
                       ('title', title), ('description', description), ('url', url),
                       ('image', image_url), ('image:secure_url', image_url),
                       ('image:type', 'image/jpeg'), ('image:width', '1200'),
                       ('image:height', '630'), ('image:alt', image_alt)]:
        rows.append(f'<meta property="og:{key}" content="{escape(value, quote=True)}">')
    for key, value in [('card', 'summary_large_image'), ('title', title),
                       ('description', description), ('image', image_url), ('image:alt', image_alt)]:
        rows.append(f'<meta name="twitter:{key}" content="{escape(value, quote=True)}">')
    rows.extend([
        '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">',
        '<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">',
        '<link rel="manifest" href="/site-manifest.json">',
    ])
    if data:
        encoded = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
        rows.append('<script type="application/ld+json">' + encoded + '</script>')
    return '\n'.join(rows + [END])


def replace_metadata(html, value):
    """Replace only the metadata block, never unrelated absolute asset URLs."""
    if START in html:
        return re.sub(re.escape(START) + r'[\s\S]*?' + re.escape(END), lambda _: value, html, count=1)
    return re.sub(r'<title>[\s\S]*?<link rel="icon"[^>]+>', lambda _: value, html, count=1)


def shared_layout(text, prefix):
    text = text.replace('href="#top"', 'href="' + prefix + '"')
    for anchor in ['work', 'experience', 'expertise']:
        text = text.replace('href="#' + anchor + '"', 'href="' + prefix + '#' + anchor + '"')
    return re.sub(r'(href|src)="(assets/|vendor/|style\.css|light-theme\.css|projects\.css|dark-theme\.css|settings\.js|motion\.js)',
                  lambda m: m[1] + '="' + prefix + m[2], text)
