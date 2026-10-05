import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const built=await build({entryPoints:['src/search.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {allProjects,searchProjects,searchHits,highlightParts}=await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
assert.equal(new Set(allProjects.map(p=>p.id)).size,allProjects.length,'Catalog IDs must be unique');
assert.ok(allProjects.length>=60,'Expanded catalog should be present');
for(const project of allProjects){
  if(project.visibility==='private'){
    assert.ok(!project.href&&!project.repo,'Private projects must not expose a repository');
    assert.ok(!JSON.stringify(project).includes('github.com'),'Private overview must not contain GitHub URLs');
  }else assert.match(project.href,/^https:\/\/github\.com\/mazamaka\//);
}
assert.ok(searchProjects('OCR').some(p=>p.title==='Document AI Pipeline'));
assert.ok(searchProjects('телеграм').some(p=>p.title==='alpha-scout'));
assert.ok(searchProjects('Python automation').some(p=>p.repo==='octo-mcp'));
assert.deepEqual(searchProjects('  MCP ').map(p=>p.id),searchProjects('mcp').map(p=>p.id));
assert.ok(searchProjects('react').length>0);
assert.ok(searchProjects('react').every(p=>/react/i.test(JSON.stringify(p))),'Exact technology queries must not expand to unrelated frameworks');
assert.ok(searchProjects('','all','private').length>0);
assert.ok(searchProjects('','all','private').every(p=>p.visibility==='private'));
assert.ok(searchProjects('','AI & agents','private','OCR').some(p=>p.title==='Document AI Pipeline'));
assert.ok(searchProjects('','all','all','FastAPI').every(p=>p.tags.includes('FastAPI')));
assert.equal(searchProjects('no-such-framework-987654321').length,0);
const googleIds=searchProjects('Google').map(p=>p.id);
for(const id of ['automation-control-platform','ai-browser-task-runner','recruiter-bot','account-issuance-bot','VoiceHelper','ai_playwright'])assert.ok(googleIds.includes(id),`Google must find ${id}, including integrations not in the short summary`);
assert.deepEqual(searchProjects('гугл').map(p=>p.id),googleIds,'Russian Google alias should have the same ranking');
assert.ok(searchProjects('Goog').some(p=>p.id==='automation-control-platform'),'Partial typing should find integrations');
assert.equal(searchProjects('google admin')[0].id,'automation-control-platform','Original public alias should remain discoverable');
assert.ok(searchProjects('Google','all','private').every(p=>p.visibility==='private'));
assert.ok(searchProjects('Google OAuth').some(p=>p.id==='automation-control-platform'),'All terms must match across project content');
assert.ok(searchProjects('time to first token').some(p=>p.id==='llm-latency-tracker'),'Content-only phrases must be indexed');
assert.ok(searchProjects('speech recognition').some(p=>p.id==='VoiceHelper'));
assert.ok(searchProjects('Gemini').some(p=>p.id==='ai_playwright'));
assert.ok(searchProjects('AI').every(p=>p.id!=='car_iaai'&&p.id!=='account-issuance-bot'),'Short AI query must not match IAAI, email or unrelated account names');
assert.equal(searchProjects('octo-mcp')[0].id,'octo-mcp','Exact project name takes priority');
assert.ok(searchHits('Speech').find(h=>h.project.id==='VoiceHelper').excerpt.includes('Google Speech Recognition'),'Match explanation must show the content that caused the result');
const raw='<img onerror=alert(1)> Google OAuth';
assert.equal(highlightParts(raw,'google').map(p=>p.text).join(''),raw,'Highlighting must keep text intact for React escaping');
assert.ok(highlightParts('Google Sheets','гугл').some(p=>p.match&&p.text==='Google'));
for(const p of allProjects){
 assert.ok(p.searchContent?.length,`${p.id} needs reviewed content`);
 assert.doesNotMatch(JSON.stringify(p),/AIza[\w-]{20,}|ghp_[\w]{20,}|\/Users\/|BEGIN PRIVATE KEY|password\s*[:=]/i,'No secrets or local paths in the public index');
}
assert.ok(searchProjects('голосовий').some(p=>p.id==='maxbob-ai'));
assert.ok(searchProjects('відбитки').some(p=>p.id==='nodriver-antidetect'));
assert.ok(searchProjects('нагадування').some(p=>p.id==='maxbob-ai'));
assert.ok(searchProjects('распознаёт').some(p=>p.id==='VoiceHelper'));
console.log(`PASS: ${allProjects.length} unique catalog entries; Google/content regressions; trilingual search and highlights; ranking; combined filters; private repository guard`);

const page=await readFile('dist/index.html','utf8');
const {cases}=JSON.parse(await readFile('src/case-studies.json','utf8'));
assert.equal(new Set(cases.map(c=>c.slug)).size,cases.length,'Case routes must be unique');
assert.equal(new Set(cases.map(c=>c.projectId)).size,cases.length,'Each project must have one case');
const directory=await readFile('dist/projects/index.html','utf8');
const gallery=page.split('<!-- PROJECT-GALLERY:START -->')[1].split('<!-- PROJECT-GALLERY:END -->')[0];
assert.equal((gallery.match(/class="p-primary"/g)??[]).length,cases.length,'Every featured card needs a case action');
for(const c of cases){
 const href=`cases/${c.slug}/`;
 assert.equal(allProjects.find(p=>p.id===c.projectId)?.caseHref,href,`${c.projectId}: search must link to its own case`);
 assert.ok(gallery.includes(`href="${href}"`),`${c.projectId}: featured card must link to its case`);
 assert.ok(directory.includes(`href="/${href}"`),`${c.projectId}: directory must link to its case`);
 const detail=await readFile(`dist/${href}index.html`,'utf8');
 for(const section of ['problem','contribution','decisions','evidence','limits'])assert.ok(detail.includes(`id="${section}"`),`${c.projectId}: missing ${section}`);
 assert.ok(detail.includes('href="/#return-to-work"'),'Cases must provide a return to the project list');
 assert.ok(cases.some(next=>next.slug===c.related),'Related case must exist');
 if(c.private){
  assert.ok(detail.includes('Visit project website'));
  assert.ok(!detail.includes('Inspect the code'),'Private overview must not imply public source');
  assert.ok(!JSON.stringify(c).includes('github.com'),'Private case data must not expose a repository');
 }
}
console.log(`PASS: all ${cases.length} featured cards, search results and directory entries link to complete case pages`);
for(const [,encoded] of page.matchAll(/href="\/?\?q=([^"#]+)#work"/g)){
 const q=decodeURIComponent(encoded);assert.ok(searchProjects(q).length,`Expertise search link must return a project: ${q}`);
}
console.log('PASS: every expertise tool link resolves to matching projects');
