from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'dist/assets/Maksym-Babenko-CV.pdf'
out.parent.mkdir(parents=True,exist_ok=True)
ink=HexColor('#172017');muted=HexColor('#596553');green=HexColor('#3f691b')
styles={
 'name':ParagraphStyle('name',fontName='Helvetica',fontSize=30,leading=34,textColor=ink,spaceAfter=9),
 'role':ParagraphStyle('role',fontName='Helvetica',fontSize=15,leading=20,textColor=green,spaceAfter=13),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=10.5,leading=15,textColor=ink,spaceAfter=8),
 'meta':ParagraphStyle('meta',fontName='Helvetica',fontSize=9,leading=13,textColor=muted,spaceAfter=10),
 'section':ParagraphStyle('section',fontName='Helvetica-Bold',fontSize=11,leading=15,textColor=green,spaceBefore=18,spaceAfter=11),
 'item':ParagraphStyle('item',fontName='Helvetica-Bold',fontSize=11,leading=15,textColor=ink,spaceAfter=4),
}
story=[]
def p(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):story.append(p(text,style))
def item(title,body):story.append(KeepTogether([p(title,'item'),p(body)]))
def link(label,url):return '<a href="'+url+'" color="#3f691b">'+label+'</a>'
add('Maksym Babenko','name')
add('Senior AI &amp; Automation Engineer','role')
add('Prague, Czechia  |  8+ years in software engineering','meta')
add(link('mazamaka603@gmail.com','mailto:mazamaka603@gmail.com')+'  |  '+link('GitHub: mazamaka','https://github.com/mazamaka')+'  |  '+link('LinkedIn','https://linkedin.com/in/max-bob-python')+'  |  '+link('Telegram','https://t.me/Mazamaka'),'meta')
add('I build AI agents, browser automation and the services around them. My work connects models and tools to real workflows, with deep experience in antifraud, browser fingerprinting and Python backends. I work across implementation, deployment, monitoring and maintenance.')
add('SELECTED ENGINEERING WORK','section')
item(link('octo-mcp','https://github.com/mazamaka/octo-mcp')+' - agent-to-browser integration','MCP server for Octo Browser profiles and browser actions. Async Local and Cloud API clients, Playwright over CDP, bounded rate-limit retries and remote browser configuration.')
item(link('alpha-scout','https://github.com/mazamaka/alpha-scout')+' - collection-to-alert automation','Scheduled multi-source collection, content deduplication, two-stage LLM evaluation, configurable scoring, Telegram alerts and a FastAPI review dashboard.')
item(link('nodriver-antidetect','https://github.com/mazamaka/nodriver-antidetect')+' + '+link('ipqs-checker','https://github.com/mazamaka/ipqs-checker'),'Browser fingerprint customization through CDP, plus an independent backend and browser-extension workflow for IP reputation and device diagnostics.')
item(link('Claudegate','https://github.com/mazamaka/claudegate')+' / '+link('LLM Latency','https://llmlatency.dev'),'OpenAI-compatible Claude Code gateway with streaming and tools; regional API measurement, open datasets and MCP access. Network responsiveness and inference latency are measured separately.')
item('AI Website Platform / '+link('MaxBob AI','https://maxbob.xyz'),'Private platform for AI-generated websites, MCP tools, background jobs, previews and deployments. Native Apple voice assistant using SwiftUI, WebRTC and a Python backend.')
add('CORE TOOLKIT','section')
add('<b>AI:</b> MCP, Claude and OpenAI APIs, tool calling, multi-agent workflows, streaming, Realtime.<br/><b>Automation:</b> Playwright, Selenium, nodriver, CDP, Octo Browser API, Android/ADB, browser extensions.<br/><b>Backend:</b> Python, FastAPI, Flask, async SQLAlchemy, PostgreSQL, Redis, Celery, RabbitMQ.<br/><b>Operations:</b> Docker, Linux, CI/CD, Nginx, Cloudflare, Prometheus/Grafana.')
story.append(PageBreak())
add('Experience &amp; background','name')
add('Hands-on engineering, automation and team leadership','meta')
add('PROFESSIONAL EXPERIENCE','section')
item('Traffic Devils - Python Developer  |  Nov 2022 - Present','Backend services, administration platforms and AI-powered browser automation. Internal bots and integrations; Docker deployments, CI/CD, centralized logging and monitoring.')
item('Freelance - RPA Python Developer  |  Jun - Nov 2022','Browser and social-platform automation with Python, Selenium, FastAPI, REST APIs and administration interfaces.')
item('AcidBro - RPA Python Developer / Team Lead  |  Jan 2021 - Jun 2022','Led an automation team. Browser and mobile workflows, antidetect browser development and server administration; Python, Zennoposter, BAS and Android tooling.')
item('Financial Broker - RPA Developer / Team Lead  |  Jun 2020 - Jan 2021','Led the automation function, including browser workflows and mobile-proxy infrastructure.')
item('Quora Project - RPA Developer  |  Sep 2019 - May 2020','Browser automation, Telegram services and mobile-proxy systems.')
item('OnlineReputation - Zennoposter Developer / SysAdmin  |  Oct 2017 - Aug 2019','Social-platform automation, HTTP workflows and IT infrastructure administration.')
add('EDUCATION','section')
add('<b>Kyiv National University of Technologies and Design (KNUTD)</b><br/>Mechatronics &amp; Computer Technologies, 2013 - 2019. Honors.')
add('LANGUAGES &amp; LOCATION','section')
add('Ukrainian: fluent. Russian: fluent. English: intermediate.<br/>Based in Prague, Czechia. Originally from Kyiv, Ukraine.')
add('CONTACT','section')
add(link('mazamaka603@gmail.com','mailto:mazamaka603@gmail.com')+'  |  +380 99 045 1609<br/>'+link('github.com/mazamaka','https://github.com/mazamaka')+'  |  '+link('linkedin.com/in/max-bob-python','https://linkedin.com/in/max-bob-python')+'<br/>Compensation target: $8,000+/month.')

def frame(canvas,doc):
 w,h=A4
 canvas.setStrokeColor(HexColor('#cbd5c1'));canvas.line(45,43,w-45,43)
 canvas.setFont('Helvetica',8);canvas.setFillColor(muted)
 canvas.drawString(45,29,'Maksym Babenko  /  AI & Automation Engineering')
 canvas.drawRightString(w-45,29,str(doc.page))

SimpleDocTemplate(str(out),pagesize=A4,leftMargin=45,rightMargin=45,topMargin=43,bottomMargin=57,title='Maksym Babenko - Senior AI & Automation Engineer',author='Maksym Babenko').build(story,onFirstPage=frame,onLaterPages=frame)
print(out)
