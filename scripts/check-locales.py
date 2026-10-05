"""Validate translated routes and reviewed copy without contacting third parties."""
from pathlib import Path
from html.parser import HTMLParser
import json,re
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';SITE='https://cv.maxbob.xyz'
dictionary={}
for file in (ROOT/'src/locales').glob('*.json'):
    values=json.loads(file.read_text())
    assert all(len(v)==2 and all(x.strip() for x in v) for v in values.values()),file
    dictionary.update(values)
for project in json.loads((ROOT/'src/catalog.json').read_text())['projects']:
    for value in [project['description'],*project['searchContent'],*([project['overview']] if project.get('overview') else [])]:assert value in dictionary,value
for case in json.loads((ROOT/'src/case-studies.json').read_text())['cases']:
    for value in [case[k] for k in ('title','description','lead','problem','result','limits','scope','type','related_name')]+case['role']+[x for pair in case['decisions'] for x in pair]:assert value in dictionary,value
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.lang=None;self.alternates={};self.languages={};self.assets=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html':self.lang=a.get('lang')
        if tag=='link' and a.get('hreflang'):self.alternates[a['hreflang']]=a['href']
        if 'data-locale-link' in a:self.languages[a['data-locale-link']]=a['href']
        if a.get('data-night-src'):self.assets.append(a['data-night-src'])
count=0
for file in DIST.rglob('*.html'):
    route='/'+file.relative_to(DIST).as_posix().removesuffix('index.html');locale=route.split('/')[1] if route.split('/')[1] in ('ru','uk') else 'en';base=re.sub(r'^/(ru|uk)/','/',route)
    doc=Page(file.read_text());assert doc.lang==locale,(file,doc.lang)
    for lang in ('en','ru','uk'):
        expected=('' if lang=='en' else '/'+lang)+base
        assert doc.languages[lang]==expected,(file,lang,doc.languages)
        assert doc.alternates[lang]==SITE+expected
    assert doc.alternates['x-default']==SITE+base
    for asset in doc.assets:assert (DIST/asset.lstrip('/')).is_file(),asset
    assert '/settings.js?v=24' in file.read_text() and '/dark-theme.css?v=24' in file.read_text()
    text=file.read_text()
    bundles=re.findall(r'<script id="page-translations" type="application/json">(.*?)</script>',text,re.S)
    assert len(bundles)==1,(file,'one inline translation bundle required')
    bundle=json.loads(bundles[0]);assert bundle['page']==base
    assert set(bundle['locales'])=={'en','ru','uk'}
    keys=set(bundle['locales']['en'])
    node_ids=re.findall(r' data-i18n-node="(n\d+)"',text)
    assert len(node_ids)==len(set(node_ids)) and set(node_ids)==keys,(file,'unique live bindings')
    for lang,entries in bundle['locales'].items():
        assert set(entries)==keys
        for entry in entries.values():
            assert set(entry)<= {'text','attrs'}
            assert all(isinstance(value,str) for value in entry.get('text',[]))
            assert set(entry.get('attrs',{}))<= {'href','title','aria-label','alt','placeholder','aria-current','content'}
    gallery=re.search(r'<!-- PROJECT-GALLERY:START -->(.*?)<!-- PROJECT-GALLERY:END -->',text,re.S)
    assert not gallery or 'data-i18n-node' not in gallery[1],'React owns the gallery translations'
    count+=1
assert count==42
assert len(list(DIST.glob('assets/**/*night-v1.webp')))==13
print('PASS: 42 language routes, equivalent language links, hreflang, full catalog/case translations and 13 night illustrations')
print('PASS: inline EN/RU/UK bindings on every page; no image, style or React-state replacement')
