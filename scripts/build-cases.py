from pathlib import Path
from html import escape
from site_metadata import metadata, graph, replace_metadata, shared_layout, SITE

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'dist/index.html').read_text()
head = source[source.index('<head>'):source.index('</head>')+7]
header = source[source.index('<header'):source.index('</header>')+9]
footer = source[source.index('<footer'):source.index('</footer>')+9]

def shared(text):
    return shared_layout(text, '../../')

CASES = [
 {
 'slug':'octo-mcp','name':'octo-mcp','type':'AI AGENTS / MCP','title':'Give agents a browser they can work with.',
 'description':'How I connected AI agents to Octo Browser with MCP, async API clients and Playwright over CDP.',
 'lead':'One MCP server connects an agent to browser profiles, page actions and the results of those actions.',
 'stack':'Python · MCP · Playwright · httpx','scope':'Public implementation',
 'problem':'An agent needs more than page access. It needs to discover and start the correct browser profile, connect to that session, execute an action and receive a usable result. Those capabilities span Octo’s Local API, Cloud API and the browser’s CDP endpoint.',
 'role':['Built the MCP tool layer for profile management and browser interaction.','Integrated asynchronous Local and Cloud API clients with Playwright over CDP.','Added bounded handling of API rate limits and configurable remote browser connections.'],
 'flow':['Agent request','MCP tool','Octo API / CDP','Browser action','Result'],
 'decisions':[('Separate profile control from page interaction','Local and Cloud APIs manage browser resources; Playwright handles the page through CDP. This keeps each integration’s responsibility explicit.'),('Handle limits without an endless retry loop','HTTP 429 retries are bounded. A failed provider request can surface as a failure instead of leaving the caller waiting indefinitely.'),('Support remote browser environments','Configurable hosts and CDP endpoint rewriting account for a browser running on another machine.')],
 'result':'The repository exposes browser and profile tools over MCP stdio, with configuration documentation, examples and CI definitions for Ruff, mypy and pytest. The implementation is available to inspect and run with your own Octo Browser installation.',
 'limits':'Requires a running Octo Browser installation. Cloud resources need an API token. Unit and integration checks do not establish universal compatibility with every website or browser environment.',
 'links':[('Source repository','https://github.com/mazamaka/octo-mcp'),('Tool reference','https://github.com/mazamaka/octo-mcp/blob/main/docs/reference.md'),('Tests','https://github.com/mazamaka/octo-mcp/tree/main/tests')],
 'related':'alpha-scout','related_name':'alpha-scout: from collection to an alert'
 },
 {
 'slug':'alpha-scout','name':'alpha-scout','type':'AI / WORKFLOW AUTOMATION','title':'Turn a stream of sources into reviewable ideas.',
 'description':'An engineering case study of alpha-scout: scheduled source collection, deduplication, LLM analysis and Telegram alerts.',
 'lead':'A complete collection-to-alert pipeline, with an LLM used for screening and analysis rather than as the entire application.',
 'stack':'Python · asyncio · Claude Code CLI · FastAPI','scope':'Public implementation',
 'problem':'Useful research ideas are scattered across feeds and communities. Collecting them is only the first step: duplicates, noisy content and independent source failures need to be handled before a human can review the results.',
 'role':['Implemented scheduled collectors and content-hash deduplication.','Connected a screening pass to deeper LLM evaluation, configurable scores and alert thresholds.','Built Telegram notifications and a dashboard for ideas and collector status.'],
 'flow':['Source schedules','Deduplication','Screening','Deeper analysis','Score & notify'],
 'decisions':[('Keep the pipeline in separate parts','Collectors, analysis and notification are separate components. Each source can run on its own schedule rather than forcing one interval on everything.'),('Use two stages of analysis','A screening pass filters incoming material before deeper evaluation. Scoring weights and notification thresholds remain configurable.'),('Keep access failures visible','Collector status and the X news fallback are labelled in the dashboard. A missing source should not silently look like an empty stream of ideas.')],
 'result':'Collected ideas can be reviewed in a FastAPI dashboard and high-scoring results delivered to configured Telegram chats. Local and Docker deployment are documented, including persistent data and logs.',
 'limits':'Collection is scheduled, not real-time. Sources can fail independently. The X collector uses session-based access rather than the official API. The project does not execute trades; an LLM score is not a measured investment return.',
 'links':[('Source repository','https://github.com/mazamaka/alpha-scout'),('Collector behaviour & configuration','https://github.com/mazamaka/alpha-scout/blob/main/docs/CONFIGURATION.md')],
 'related':'browser-fingerprinting','related_name':'Browser fingerprinting: customization and diagnostics'
 },
 {
 'slug':'browser-fingerprinting','name':'Browser fingerprinting','type':'ANTIFRAUD / BROWSER ENGINEERING','title':'Configure the browser. Inspect the signals.',
 'description':'Browser fingerprint customization and diagnostic tooling with nodriver-antidetect and ipqs-checker.',
 'lead':'Two complementary projects: one works on browser configuration, the other makes IP and device signals easier to inspect.',
 'stack':'Python · nodriver · CDP · FastAPI · Extensions','scope':'Two public implementations',
 'problem':'Browser behaviour is influenced by rendering, platform properties, runtime configuration and the network environment. Working with one signal in isolation makes it difficult to understand what actually changed.',
 'role':['Implemented configurable browser fingerprint customization through CDP in nodriver-antidetect.','Built an IP and device diagnostic backend and browser extensions in ipqs-checker.','Organized runtime configuration and checks so observations can be reviewed alongside the environment.'],
 'flow':['Runtime configuration','Browser session','Diagnostic checks','Review signals'],
 'decisions':[('Treat configuration and diagnostics as different jobs','nodriver-antidetect controls aspects of the browser environment. ipqs-checker focuses on observing IP reputation and device signals. They are independent tools, not a claimed automatic closed-loop system.'),('Look below high-level browser wrappers','CDP-level controls expose browser behaviour that a click-and-type script does not address. Diagnostic surfaces include rendering and platform characteristics.'),('Keep network and device evidence in view','IP reputation and browser properties describe different parts of the environment. The checker provides a backend and extension workflow for reviewing them.')],
 'result':'The public repositories provide browser customization code and a separate diagnostic application. They demonstrate work across browser internals, Python services and extensions.',
 'limits':'A diagnostic result is an observation for a particular environment and moment. It is not a guarantee of being undetectable or of compatibility with every anti-bot system. The portfolio illustration does not collect the visitor’s fingerprint.',
 'links':[('nodriver-antidetect repository','https://github.com/mazamaka/nodriver-antidetect'),('ipqs-checker repository','https://github.com/mazamaka/ipqs-checker')],
 'related':'octo-mcp','related_name':'octo-mcp: connect agents to browser tools'
 }
]

for case in CASES:
    path = '/cases/' + case['slug'] + '/'
    page_title = case['name'] + ' — Engineering Case Study | MaxBob'
    data = graph(path, page_title, case['description'], extra={
        'mainEntity': {'@type': 'CreativeWork', 'name': case['name'], 'description': case['lead'],
                       'author': {'@id': SITE + '/#person'}, 'url': SITE + path,
                       'sameAs': [url for _, url in case['links']]},
        'breadcrumb': {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': case['name'], 'item': SITE + path}]}})
    h = shared(replace_metadata(head, metadata(path, page_title, case['description'],
        image=case['slug'] + '-v1.jpg', image_alt=case['name'] + ' — engineering case study by Maksym Babenko.', data=data)))
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
<aside class="case-aside"><h2>Inside this case</h2><nav aria-label="Case sections"><a href="#problem">Problem</a><a href="#contribution">My contribution</a><a href="#decisions">Engineering decisions</a><a href="#evidence">Code & evidence</a><a href="#limits">Scope & limitations</a></nav><a class="button-primary" href="{case['links'][0][1]}" target="_blank" rel="noreferrer">Inspect the code</a></aside></div>
<div class="case-end"><div><p>CONTINUE EXPLORING</p><a class="text-link" href="../{case['related']}/">{escape(case['related_name'])}</a></div><a class="text-link" href="../../#return-to-work">Back to projects</a></div></main>{shared(footer)}</body></html>'''
    out=ROOT/'dist/cases'/case['slug'];out.mkdir(parents=True,exist_ok=True);(out/'index.html').write_text(text)
print('Built',len(CASES),'case studies')
