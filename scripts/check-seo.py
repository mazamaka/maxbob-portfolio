"""Check discoverability, metadata and private-project boundaries without network requests."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SITE = 'https://cv.maxbob.xyz'


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta, self.links, self.data, self.ids = {}, [], [], set()
        self.in_schema = False
        self.schema = ''
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            key = a.get('property', a.get('name'))
            if key:
                assert key not in self.meta, f'Duplicate metadata: {key}'
                self.meta[key] = a.get('content')
        if tag in ['link', 'a']:
            self.links.append(a)
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_schema = True
            self.schema = ''

    def handle_data(self, data):
        if self.in_schema:
            self.schema += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_schema:
            self.data.append(json.loads(self.schema))
            self.in_schema = False


def jpeg_size(p):
    data = p.read_bytes()
    assert data.startswith(b'\xff\xd8')
    at = 2
    while at < len(data):
        assert data[at] == 255
        marker = data[at + 1]
        size = int.from_bytes(data[at + 2:at + 4], 'big')
        if marker in [0xC0, 0xC2]:
            height, width = struct.unpack('>HH', data[at + 5:at + 9])
            return width, height
        at += 2 + size
    raise AssertionError('JPEG dimensions not found')


pages = list(DIST.rglob('*.html'))
canonicals = []
descriptions = []
for file in pages:
    text = file.read_text()
    doc = Document(text)
    relative = file.relative_to(DIST).as_posix().removesuffix('index.html')
    expected = SITE + '/' + relative
    canonical = [x['href'] for x in doc.links if x.get('rel') == 'canonical']
    assert canonical == [expected], (file, canonical)
    assert doc.meta['og:url'] == expected
    assert doc.meta['twitter:card'] == 'summary_large_image'
    assert doc.meta['og:image'] == doc.meta['twitter:image'] == doc.meta['og:image:secure_url']
    assert doc.meta['og:image'].startswith(SITE + '/assets/social/')
    assert (doc.meta['og:image:width'], doc.meta['og:image:height']) == ('1200', '630')
    assert doc.meta['og:image:alt'] and doc.meta['twitter:image:alt']
    assert 'noindex' not in doc.meta['robots'] and 'max-image-preview:large' in doc.meta['robots']
    asset = DIST / urlsplit(doc.meta['og:image']).path.lstrip('/')
    assert jpeg_size(asset) == (1200, 630), asset
    assert asset.stat().st_size < 1_000_000
    assert len(doc.data) == 1
    graph = doc.data[0]['@graph']
    assert any(n.get('@id') == SITE + '/#person' for n in graph)
    page = next(n for n in graph if n.get('@id') == expected + '#webpage')
    assert page['url'] == expected and page['isPartOf']['@id'] == SITE + '/#website'
    base_relative=re.sub(r"^(ru|uk)/", "", relative)
    if base_relative:
        assert not any(n['@type'] == 'ProfilePage' for n in graph)
    for rel in ['icon', 'apple-touch-icon', 'manifest']:
        assert any(x.get('rel') == rel and x['href'].startswith('/') for x in doc.links)
    canonicals.append(expected)
    descriptions.append(doc.meta['description'])
assert len(set(descriptions)) == len(pages)
sitemap = ET.parse(DIST / 'sitemap.xml')
urls = [node.text for node in sitemap.findall('.//{*}loc')]
assert set(urls) == set(canonicals) and len(urls) == len(canonicals)
assert 'Sitemap: ' + SITE + '/sitemap.xml' in (DIST / 'robots.txt').read_text()
assert not re.search(r'^Disallow:\s*/\s*$', (DIST / 'robots.txt').read_text(), re.M)

catalog = json.loads((ROOT / 'src/catalog.json').read_text())['projects']
directory = (DIST / 'projects/index.html').read_text()
doc = Document(directory)
for project in catalog:
    assert project['id'] in doc.ids, project['id']
    if project['visibility'] == 'private':
        assert not project.get('href'), 'Private repository link must never be generated'
        section = directory.split('id="' + project['id'] + '"', 1)[1].split('</article>', 1)[0]
        assert 'github.com/' not in section and 'Private project' in section
assert 'SearchAction' not in directory, 'Do not advertise a nonexistent server search endpoint'
for size, name in [(96,'favicon-96x96.png'),(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:
    raw = (DIST / name).read_bytes()
    assert raw.startswith(b'\x89PNG\r\n\x1a\n') and struct.unpack('>II', raw[16:24]) == (size, size)
ico = (DIST / 'favicon.ico').read_bytes()
assert struct.unpack('<HHH', ico[:6]) == (0, 1, 3)
assert [ico[6 + i * 16] for i in range(3)] == [16, 32, 48]
assert json.loads((DIST / 'site-manifest.json').read_text())['start_url'] == '/'
print(f'PASS: {len(pages)} canonical pages, OG/Twitter cards, linked data, sitemap, icons and {len(catalog)} crawlable project summaries; private links absent')
