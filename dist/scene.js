const hero=document.querySelector('.hero');
const modes={
 ai:{title:'AGENT TO ACTION',name:'octo-mcp',summary:'Give an AI agent browser tools through MCP, Playwright and CDP.',signals:['Agent','MCP tools','Browser'],description:'An illustrative model of the agent-to-browser workflow.',href:'cases/octo-mcp/',link:'Read the octo-mcp case'},
 automation:{title:'COLLECTION TO ALERT',name:'alpha-scout',summary:'Collect research signals, evaluate them with an LLM and deliver focused alerts.',signals:['Sources','LLM analysis','Telegram'],description:'Scheduled collection with a review dashboard and visible source status.',href:'cases/alpha-scout/',link:'Read the alpha-scout case'},
 antifraud:{title:'BROWSER SURFACES',name:'Browser fingerprinting',summary:'Browser customization and diagnostics with nodriver-antidetect and ipqs-checker.',signals:['Configure','Measure','Compare'],description:'Illustrative surfaces. No device fingerprint is collected.',href:'cases/browser-fingerprinting/',link:'Read the fingerprinting case'}
};
let selected='ai',heroMode='ai',calm=false;
function selectMode(mode){
 heroMode=mode;selected=mode;hero.dataset.scene=mode;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const data=modes[mode];
 document.querySelector('#scene-title').textContent=data.title;
 document.querySelector('#scene-signals').replaceChildren(...data.signals.map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));
 document.querySelector('#scene-description').textContent=data.description;
 document.querySelector('#spotlight-name').textContent=data.name;
 document.querySelector('#spotlight-summary').textContent=data.summary;
 const link=document.querySelector('#spotlight-link');link.href=data.href;link.textContent=data.link;
}
selectMode(selected);document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
