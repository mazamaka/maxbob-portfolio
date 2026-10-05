from pathlib import Path
import json
from html import escape
from site_metadata import metadata, graph, replace_metadata, shared_layout, SITE

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'dist/index.html').read_text()
head = source[source.index('<head>'):source.index('</head>')+7]
header = source[source.index('<header'):source.index('</header>')+9]
footer = source[source.index('<footer'):source.index('</footer>')+9]

def shared(text):
    return shared_layout(text, '../../')

CASES = json.loads((ROOT / 'src/case-studies.json').read_text())['cases']

for case in CASES:
    path = '/cases/' + case['slug'] + '/'
    page_kind = 'Project Overview' if case.get('private') else 'Engineering Case Study'
    page_title = case['name'] + ' — ' + page_kind + ' | MaxBob'
    data = graph(path, page_title, case['description'], extra={
        'mainEntity': {'@type': 'CreativeWork', 'name': case['name'], 'description': case['lead'],
                       'author': {'@id': SITE + '/#person'}, 'url': SITE + path,
                       'sameAs': [url for _, url in case['links']]},
        'breadcrumb': {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': case['name'], 'item': SITE + path}]}})
    h = shared(replace_metadata(head, metadata(path, page_title, case['description'],
        image=case['slug'] + '-v1.jpg', image_alt=case['name'] + ' — ' + page_kind.lower() + ' by Maksym Babenko.', data=data)))
    links=''.join('<a href="'+url+'" target="_blank" rel="noreferrer">'+escape(label)+'</a>' for label,url in case['links'])
    role=''.join('<li>'+escape(item)+'</li>' for item in case['role'])
    decisions=''.join('<p><strong>'+escape(title)+'.</strong> '+escape(body)+'</p>' for title,body in case['decisions'])
    flow=''.join('<span>'+escape(label)+'</span>' for label in case['flow'])
    title=escape(case['title'])
    text=f'''<!doctype html><html lang="en" data-theme="light">{h}<body class="case-page">
<a class="skip" href="#problem">Skip to case study</a><div class="reading-progress" aria-hidden="true"></div>{shared(header)}
<main class="case-main wrap"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../">Home</a><a href="../../#return-to-work">All projects</a><span>{escape(case['name'])}</span></nav>
<section class="case-hero"><p class="project-kicker">{case['type']}</p><h1>{title}</h1><p class="lead">{escape(case['lead'])}</p><div class="case-meta"><div><b>Project</b>{escape(case['name'])}</div><div><b>Scope</b>{case['scope']}</div><div><b>Stack</b>{case['stack']}</div></div></section>
<div class="case-layout"><div class="case-sections"><section class="case-section" id="problem"><h2>The problem</h2><p>{escape(case['problem'])}</p></section><section class="case-section" id="contribution"><h2>My contribution</h2><ul>{role}</ul></section><section class="case-section" id="decisions"><h2>How the system works</h2><div class="case-flow" aria-label="Workflow">{flow}</div>{decisions}</section><section class="case-section" id="evidence"><h2>What you can verify</h2><p>{escape(case['result'])}</p><div class="evidence-links">{links}</div></section><section class="case-section" id="limits"><h2>Scope & limitations</h2><p>{escape(case['limits'])}</p></section></div>
<aside class="case-aside"><h2>Inside this case</h2><nav aria-label="Case sections"><a href="#problem">Problem</a><a href="#contribution">My contribution</a><a href="#decisions">Engineering decisions</a><a href="#evidence">Code & evidence</a><a href="#limits">Scope & limitations</a></nav><a class="button-primary" href="{case['links'][0][1]}" target="_blank" rel="noreferrer">{escape(case.get('primary_label', 'Inspect the code'))}</a></aside></div>
<div class="case-end"><div><p>CONTINUE EXPLORING</p><a class="text-link" href="../{case['related']}/">{escape(case['related_name'])}</a></div><a class="text-link" href="../../#return-to-work">Back to projects</a></div></main>{shared(footer)}</body></html>'''
    out=ROOT/'dist/cases'/case['slug'];out.mkdir(parents=True,exist_ok=True);(out/'index.html').write_text(text)
print('Built',len(CASES),'case studies')
