from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote

ROOT=Path(__file__).resolve().parents[1]/'dist'
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.ids=set();self.links=[];self.titles=0;self.desc=0;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.add(a['id'])
        if tag=='title':self.titles+=1
        if tag=='meta' and a.get('name')=='description' and a.get('content'):self.desc+=1
        if a.get('href'):self.links.append(a['href'])
        if a.get('src'):self.links.append(a['src'])

pages={p:Page(p.read_text()) for p in ROOT.rglob('*.html')}
errors=[];n=0
for path,page in pages.items():
    if page.titles!=1 or page.desc!=1:errors.append(str(path)+' metadata')
    for link in page.links:
        u=urlsplit(link)
        if u.scheme or u.netloc:continue
        target=(ROOT/unquote(u.path.lstrip('/'))) if u.path.startswith('/') else (path.parent/unquote(u.path)) if u.path else path
        target=target.resolve()
        if target.is_dir():target=target/'index.html'
        n+=1
        if not target.is_file():errors.append(str(path)+': missing '+link);continue
        if u.fragment and target.suffix=='.html' and u.fragment not in pages.get(target,Page(target.read_text())).ids:errors.append(str(path)+': missing anchor '+link)
assert not errors,'\n'.join(errors)
assert (ROOT/'assets/Maksym-Babenko-CV.pdf').read_bytes().startswith(b'%PDF-')
print(f'PASS: {len(pages)} pages; {n} local links/assets/anchors; PDF signature; titles and descriptions')
