"""Build readable, indexable language routes from the reviewed English source."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
from urllib.parse import urlsplit, urlunsplit, urljoin
import json
import re
from site_metadata import SITE

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
LANGS=('en','ru','uk')
DICTIONARY={}
for name in ('ui','catalog','cases'):
    DICTIONARY.update(json.loads((ROOT/f'src/locales/{name}.json').read_text()))

def translate(value,lang):
    if lang=='en':return value
    key=value.strip()
    translated=DICTIONARY.get(key,[key,key])[0 if lang=='ru' else 1]
    for suffix,ru,uk in [(' — Engineering Case Study | MaxBob',' — Инженерный разбор | MaxBob',' — Інженерний розбір | MaxBob'),(' — Project Overview | MaxBob',' — Обзор проекта | MaxBob',' — Огляд проєкту | MaxBob'),(' — engineering case study by Maksym Babenko.',' — инженерный разбор Максима Бабенко.',' — інженерний розбір Максима Бабенка.'),(' — project overview by Maksym Babenko.',' — обзор проекта Максима Бабенко.',' — огляд проєкту Максима Бабенка.')]:
        if key.endswith(suffix):translated=key[:-len(suffix)]+(ru if lang=='ru' else uk)
    return value[:len(value)-len(value.lstrip())]+translated+value[len(value.rstrip()):] if key else value

sources={}
for file in DIST.rglob('*.html'):
    if file.relative_to(DIST).parts[0] in ('ru','uk'):continue
    path='/'+file.relative_to(DIST).as_posix().removesuffix('index.html')
    source=re.sub(r'<script id="page-translations" type="application/json">[\s\S]*?</script>', '', file.read_text())
    # React owns this subtree. Its locale changes through the existing provider.
    source=re.sub(r'<!-- PROJECT-GALLERY:START -->[\s\S]*?<!-- PROJECT-GALLERY:END -->', '<!-- PROJECT-GALLERY:START --><!-- PROJECT-GALLERY:END -->', source)
    sources[path]=source

def locale_path(path,lang):return ('' if lang=='en' else '/'+lang)+path

class LocalizedPage(HTMLParser):
    def __init__(self,path,lang):
        super().__init__(convert_charrefs=True)
        self.path,self.lang=path,lang
        self.out=[];self.raw=None;self.current_locale=False
        self.stack=[];self.bindings={};self.counter=0
    def fix_url(self,value):
        parts=urlsplit(value)
        if parts.scheme and parts.scheme not in ('http','https'):return value
        if parts.netloc and parts.netloc!=urlsplit(SITE).netloc:return value
        resolved=urlsplit(urljoin(SITE+self.path,value))
        target=locale_path(resolved.path,self.lang) if resolved.path in sources else resolved.path
        return urlunsplit((parts.scheme,parts.netloc,target,resolved.query,resolved.fragment)) if parts.netloc else urlunsplit(('','',target,resolved.query,resolved.fragment))
    def schema(self,value):
        if isinstance(value,list):return [self.schema(x) for x in value]
        if isinstance(value,dict):return {k:self.lang if k=='inLanguage' else self.schema(v) for k,v in value.items()}
        if isinstance(value,str):
            if value in (SITE+'/#person',SITE+'/#website'):return value
            if value.startswith(SITE):return self.fix_url(value)
            return translate(value,self.lang)
        return value
    def handle_decl(self,decl):self.out.append('<!'+decl+'>')
    def handle_comment(self,value):self.out.append('<!--'+value+'-->')
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        a.pop('data-i18n-node',None)
        if tag=='link' and a.get('rel')=='alternate' and 'hreflang' in a:return
        if tag=='html':a['lang']=self.lang
        if 'data-current-locale' in a:self.current_locale=True
        for key in ('href','src','data-night-src'):
            if key in a:a[key]=self.fix_url(a[key])
        for key in ('title','aria-label','alt','placeholder'):
            if a.get(key):a[key]=translate(a[key],self.lang)
        if 'data-locale-link' in a:
            language=a['data-locale-link'];a['href']=locale_path(self.path,language)
            if language==self.lang:a['aria-current']='true'
            else:a.pop('aria-current',None)
        if tag=='meta':
            key=a.get('property',a.get('name'))
            if key in ('description','og:title','og:description','og:image:alt','twitter:title','twitter:description','twitter:image:alt'):a['content']=translate(a['content'],self.lang)
            if key=='og:locale':a['content']={'en':'en_US','ru':'ru_RU','uk':'uk_UA'}[self.lang]
            if key=='og:url':a['content']=SITE+locale_path(self.path,self.lang)
        if tag=='script':self.raw='schema' if a.get('type')=='application/ld+json' else 'script'
        if tag=='style':self.raw='style'
        # Stable element bindings update only text and translated attributes;
        # existing nodes, event listeners, images and animation state survive.
        dynamic={'menu-toggle','motion-toggle','copy-status','scene-title','scene-signals','scene-description','spotlight-name','spotlight-summary','spotlight-link'}
        blocked=(self.stack and self.stack[-1][2]) or tag in ('noscript','style') or (tag=='script' and self.raw!='schema') or a.get('id') in dynamic
        key=None
        if not blocked and tag not in ('html','head','body'):
            key=f'n{self.counter}';self.counter+=1;a['data-i18n-node']=key
            self.bindings[key]={'text':[], 'attrs':{k:v for k,v in a.items() if k in ('href','title','aria-label','alt','placeholder','aria-current') or (tag=='meta' and k=='content')}}
        if tag not in ('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'):
            self.stack.append((tag,key,bool(blocked)))
        self.out.append('<'+tag+''.join(' '+k+('="'+escape(v,quote=True)+'"' if v is not None else '') for k,v in a.items())+'>')
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in ("area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"):self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if tag=='head':
            for lang in LANGS:self.out.append(f'<link rel="alternate" hreflang="{lang}" href="{SITE}{locale_path(self.path,lang)}">')
            self.out.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}{self.path}">')
        if tag in ('script','style'):self.raw=None
        if tag=='span':self.current_locale=False
        if self.stack and self.stack[-1][0]==tag:self.stack.pop()
        self.out.append('</'+tag+'>')
    def handle_data(self,value):
        if self.raw=='schema':translated=json.dumps(self.schema(json.loads(value)),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
        elif self.raw:translated=value
        elif self.current_locale:translated=self.lang.upper()
        else:translated=translate(value,self.lang)
        if self.stack and self.stack[-1][1]:self.bindings[self.stack[-1][1]]['text'].append(translated)
        self.out.append(translated if self.raw else escape(translated,quote=False))

paths=[]
for path,source in sources.items():
    pages={};bindings={}
    for lang in LANGS:
        parser=LocalizedPage(path,lang);parser.feed(source);text=''.join(parser.out)
        if '<!-- PROJECT-GALLERY:START -->' in text:
            gallery=(ROOT/f'.sites-runtime/gallery-{lang}.html').read_text()
            text=re.sub(r'<!-- PROJECT-GALLERY:START -->[\s\S]*?<!-- PROJECT-GALLERY:END -->',lambda _:f'<!-- PROJECT-GALLERY:START --><div id="project-gallery">{gallery}</div><!-- PROJECT-GALLERY:END -->',text)
        pages[lang]=text;bindings[lang]=parser.bindings
    # Embed only changing fields; no translation request is needed on a click.
    payload={lang:{} for lang in LANGS}
    for key,english in bindings['en'].items():
        assert all(key in bindings[lang] for lang in LANGS),(path,key)
        texts={lang:bindings[lang][key]['text'] for lang in LANGS}
        attrs=set().union(*(bindings[lang][key]['attrs'] for lang in LANGS))
        changed=[name for name in attrs if len({bindings[lang][key]['attrs'].get(name) for lang in LANGS})>1]
        has_text=any(texts[lang]!=texts['en'] for lang in LANGS)
        if not changed and not has_text:continue
        for lang in LANGS:
            entry={}
            if has_text:entry['text']=texts[lang]
            if changed:entry['attrs']={name:bindings[lang][key]['attrs'].get(name) for name in sorted(changed)}
            payload[lang][key]=entry
    data=json.dumps({'page':path,'locales':payload},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    for lang,text in pages.items():
        text=re.sub(r' data-i18n-node="(n\d+)"',lambda m:m.group(0) if m[1] in payload[lang] else '',text)
        text=text.replace('</body>',f'<script id="page-translations" type="application/json">{data}</script></body>')
        dest=locale_path(path,lang);out=DIST/dest.lstrip('/')/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);paths.append(dest)
(DIST/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(f'<url><loc>{SITE}{path}</loc></url>' for path in paths)+'\n</urlset>\n')
llms=(DIST/'llms.txt').read_text().split('\n## Languages')[0]
(DIST/'llms.txt').write_text(llms+'\n## Languages\n\n- [English]('+SITE+'/): Default language.\n- [Русский]('+SITE+'/ru/): Русская версия портфолио и проектов.\n- [Українська]('+SITE+'/uk/): Українська версія портфоліо та проєктів.\n')
print(f'Built {len(paths)} language pages with canonical and hreflang links')
