"""Build the public, two-page CV from reviewed portfolio and resume content."""
from pathlib import Path
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets/Maksym-Babenko-CV.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
FONTS = Path(reportlab.__file__).parent / 'fonts'
for name, filename in [('CVSans', 'Vera.ttf'), ('CVSans-Bold', 'VeraBd.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / filename)))
pdfmetrics.registerFontFamily('CVSans', normal='CVSans', bold='CVSans-Bold')
pdfmetrics.registerFont(TTFont('CVDisplay', str(ROOT / 'dist/assets/fonts/fraunces-regular.ttf')))
INK, GREEN, MUTED, RULE = map(HexColor, ['#233631', '#345e50', '#5c6863', '#d7dfd9'])
MARGIN = 43
WIDTH = A4[0] - 2 * MARGIN - 12
styles = {
    'name': ParagraphStyle('name', fontName='CVDisplay', fontSize=31, leading=36, textColor=INK, spaceAfter=3),
    'role': ParagraphStyle('role', fontName='CVSans-Bold', fontSize=12, leading=17, textColor=GREEN, spaceAfter=7),
    'body': ParagraphStyle('body', fontName='CVSans', fontSize=9.3, leading=13.3, textColor=INK, spaceAfter=5),
    'meta': ParagraphStyle('meta', fontName='CVSans', fontSize=8.4, leading=12.5, textColor=MUTED, spaceAfter=4),
    'section': ParagraphStyle('section', fontName='CVSans-Bold', fontSize=9.1, leading=13, textColor=GREEN, spaceBefore=12, spaceAfter=7, keepWithNext=True),
    'title': ParagraphStyle('title', fontName='CVSans-Bold', fontSize=9.7, leading=14, textColor=INK, spaceAfter=3, keepWithNext=True),
    'date': ParagraphStyle('date', fontName='CVSans', fontSize=8.2, leading=14, textColor=MUTED, alignment=TA_RIGHT),
    'bullet': ParagraphStyle('bullet', fontName='CVSans', fontSize=9.1, leading=12.8, textColor=INK, leftIndent=9, firstLineIndent=-9, spaceAfter=3),
    'project': ParagraphStyle('project', fontName='CVSans', fontSize=9.2, leading=13, textColor=INK, spaceAfter=3),
    'links': ParagraphStyle('links', fontName='CVSans', fontSize=8.2, leading=11.5, textColor=MUTED, spaceAfter=9),
}
story = []
def p(text, style='body'):
    return Paragraph(text, styles[style])
def add(text, style='body'):
    story.append(p(text, style))
def link(label, url):
    url = escape(url, {'"': '&quot;'})
    return f'<a href="{url}" color="#345e50"><u>{escape(label)}</u></a>'
def section(title):
    add(title.upper(), 'section')
def job(company, role, dates, bullets):
    title = Table([[p(f'{company} <font name="CVSans">| {role}</font>', 'title'), p(dates, 'date')]], colWidths=[WIDTH - 143, 143])
    title.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 2)]))
    story.append(KeepTogether([title, *[p('- ' + text, 'bullet') for text in bullets], Spacer(1, 5)]))
def project(title, focus, body, links):
    story.append(KeepTogether([p(f'{title} <font name="CVSans" color="#5c6863">| {focus}</font>', 'title'), p(body, 'project'), p(' &nbsp; / &nbsp; '.join(link(label, url) for label, url in links), 'links')]))

add('Maksym Babenko', 'name')
add('Senior AI &amp; Automation Engineer | Python', 'role')
add('<b>8+ years in software engineering</b> &nbsp; | &nbsp; Prague, Czechia &nbsp; | &nbsp; Originally from Kyiv, Ukraine', 'meta')
add(link('cv.maxbob.xyz', 'https://cv.maxbob.xyz/') + ' &nbsp; / &nbsp; ' + link('github.com/mazamaka', 'https://github.com/mazamaka') + ' &nbsp; / &nbsp; ' + link('LinkedIn: max-bob-python', 'https://linkedin.com/in/max-bob-python'), 'meta')
add(link('mazamaka603@gmail.com', 'mailto:mazamaka603@gmail.com') + ' &nbsp; / &nbsp; ' + link('Telegram: @Mazamaka', 'https://t.me/Mazamaka') + ' &nbsp; / &nbsp; ' + link('+380 99 045 1609', 'tel:+380990451609'), 'meta')
story.extend([Spacer(1, 7), HRFlowable(width='100%', thickness=.7, color=RULE), Spacer(1, 9)])
add('I build AI agents, browser automation and production Python services. My focus is connecting models to tools and operational workflows, with deep experience in browser fingerprinting, antifraud diagnostics and API integrations. I have led automation teams and work across architecture, implementation, deployment and ongoing operations.')
section('Core expertise')
add('<b>AI &amp; agents:</b> MCP, Claude and OpenAI APIs, tool calling, streaming, browser-use, multi-agent workflows and realtime voice.<br/>'
    '<b>Browser &amp; antifraud:</b> Playwright, Selenium, nodriver, CDP, Octo Browser, Android/ADB; Canvas, WebGL, Audio and TLS fingerprints; IP reputation diagnostics.<br/>'
    '<b>Python &amp; data:</b> FastAPI, Flask, asyncio, aiohttp, SQLAlchemy, Alembic, PostgreSQL, MySQL, Redis and MinIO.<br/>'
    '<b>Orchestration &amp; delivery:</b> Celery, RabbitMQ, Temporal, Docker, Linux, GitLab CI/CD, Nginx, Cloudflare, Prometheus/Grafana; React/TypeScript and browser extensions.')
section('Professional experience')
job('Traffic Devils', 'Python Developer', 'Nov 2022 - Present', [
    'Develop Python services and administration platforms for task orchestration, browser profiles, audit trails, provider integrations and live operational updates.',
    'Build AI-powered browser workers and Telegram workflows; integrate Gmail/OAuth, Google Ads, Google Sheets, payment services and LLM providers.',
    'Maintain Docker deployments, CI/CD, centralized logging, MinIO artifacts, monitoring and health checks for automation workers.',
])
job('Freelance', 'RPA Python Developer', 'Jun 2022 - Nov 2022', ['Built browser and social-platform automation with Selenium, FastAPI, REST APIs, administration interfaces and proxy/session management.'])
job('AcidBro', 'RPA Python Developer / Team Lead', 'Jan 2021 - Jun 2022', ['Led automation delivery across browser and Android workflows using Python, Zennoposter and BAS; contributed to antidetect browser development and maintained server infrastructure.'])
job('Financial Broker', 'RPA Developer / Team Lead', 'Jun 2020 - Jan 2021', ['Led the automation function, developed browser workflows and operated mobile-proxy infrastructure.'])
job('Quora Project', 'RPA Developer', 'Sep 2019 - May 2020', ['Built browser automation and Telegram services; configured mobile-proxy systems for automated workflows.'])
job('OnlineReputation', 'Developer / SysAdmin', 'Oct 2017 - Aug 2019', ['Developed Zennoposter automation and HTTP workflows; administered office networks and IT infrastructure.'])

story.append(PageBreak())
add('Selected engineering work', 'name')
add('Public code, technical case studies and selected private systems', 'meta')
story.extend([Spacer(1, 4), HRFlowable(width='100%', thickness=.7, color=RULE), Spacer(1, 12)])
project('octo-mcp', 'AI agent tooling',
        'MCP server connecting agents to Octo Browser Local and Cloud APIs. Async profile management, Playwright actions over CDP, remote browser hosts and bounded retries for API rate limits.',
        [('GitHub', 'https://github.com/mazamaka/octo-mcp'), ('Technical case study', 'https://cv.maxbob.xyz/cases/octo-mcp/')])
project('Alpha Scout', 'Research and decision pipelines',
        'Scheduled collection from Reddit, GitHub, Hacker News, RSS and other sources. Content deduplication, two-stage LLM screening and analysis, configurable scoring, Telegram alerts and a FastAPI dashboard.',
        [('GitHub', 'https://github.com/mazamaka/alpha-scout'), ('Technical case study', 'https://cv.maxbob.xyz/cases/alpha-scout/')])
project('Claudegate + Server Ops', 'AI infrastructure',
        'OpenAI-compatible Claude Code gateway with streaming, tool calls, image input and persistent sessions. Supporting Linux deployment tooling adds systemd services, completion-based health probes and end-to-end smoke checks.',
        [('Gateway source', 'https://github.com/mazamaka/claudegate'), ('Operations source', 'https://github.com/mazamaka/claude-code-server-ops')])
project('Browser fingerprinting &amp; diagnostics', 'Antifraud engineering',
        'CDP-level fingerprint customization in isolated Docker environments. FastAPI and Chrome/Firefox extensions connect IP-quality checks with device diagnostics; browser instrumentation exposes fingerprinting API calls.',
        [('nodriver-antidetect', 'https://github.com/mazamaka/nodriver-antidetect'), ('ipqs-checker', 'https://github.com/mazamaka/ipqs-checker'), ('antifraud-spy', 'https://github.com/mazamaka/antifraud-spy')])
project('LLM Latency Tracker', 'Observability and open data',
        'Distributed regional probes for API availability and latency, with p50/p95 statistics, historical snapshots, JSON API and MCP access. Network response time and optional inference time-to-first-token are measured separately.',
        [('GitHub', 'https://github.com/mazamaka/llm-latency-tracker'), ('Live dashboard', 'https://llmlatency.dev')])
project('BlueStacks Antidetect', 'Device automation',
        'FastAPI and Android Debug Bridge manage emulator instances, device profiles and proxy routing. Extends automation beyond browser tabs into Android environments.',
        [('GitHub', 'https://github.com/mazamaka/bluestacks-antidetect')])
project('AI Website Platform', 'Private implementation',
        'Platform for generating and managing networks of websites. MCP tools and background jobs connect AI content generation, previews, publishing and monitoring through an administration interface.',
        [('Public overview', 'https://cv.maxbob.xyz/?q=AI%20Website%20Platform#work')])
project('MaxBob AI', 'Native voice applications',
        'SwiftUI assistant across iOS, macOS and watchOS, backed by Python services. WebRTC carries realtime audio; Apple integrations include reminders, shortcuts and cross-device workflows. Source code is private.',
        [('Live product', 'https://maxbob.xyz'), ('Portfolio overview', 'https://cv.maxbob.xyz/?q=MaxBob%20AI#work')])
section('Education & languages')
add('<b>Kyiv National University of Technologies and Design (KNUTD)</b><br/>'
    'Mechatronics &amp; Computer Technologies - Electrical Engineering, 2013 - 2019. Graduated with honors.<br/>'
    '<b>Languages:</b> Ukrainian - fluent; Russian - fluent; English - intermediate.', 'meta')
add('<b>Compensation target:</b> $8,000+/month. &nbsp; <b>More work:</b> ' + link('Portfolio & case studies', 'https://cv.maxbob.xyz/') + ' / ' + link('GitHub', 'https://github.com/mazamaka'), 'meta')

def frame(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(GREEN)
    canvas.rect(MARGIN, height - 24, 34, 2.5, fill=1, stroke=0)
    canvas.setStrokeColor(RULE); canvas.setLineWidth(.6)
    canvas.line(MARGIN, 39, width - MARGIN, 39)
    canvas.setFont('CVSans', 7.4); canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 26, 'Maksym Babenko | AI & Automation Engineering')
    canvas.setFillColor(GREEN)
    canvas.drawRightString(width - MARGIN - 36, 26, 'cv.maxbob.xyz')
    link_width = pdfmetrics.stringWidth('cv.maxbob.xyz', 'CVSans', 7.4)
    canvas.linkURL('https://cv.maxbob.xyz/', (width - MARGIN - 36 - link_width, 24, width - MARGIN - 36, 34), relative=0)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(width - MARGIN, 26, f'{doc.page} / 2')
    canvas.restoreState()

SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=35, bottomMargin=49,
    title='Maksym Babenko | Senior AI & Automation Engineer', author='Maksym Babenko',
    subject='Experience, selected projects and technical expertise',
    keywords='AI engineer, Python, automation, MCP, browser engineering, antifraud, FastAPI',
).build(story, onFirstPage=frame, onLaterPages=frame)
print(OUT)
