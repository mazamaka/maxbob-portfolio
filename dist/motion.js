const root = document.documentElement;
const t = window.portfolioI18n?.t || (value=>value);
if(location.hash==='#return-to-work')try{const q=sessionStorage.getItem('maxbob-return-search')||'';history.replaceState(null,'',`${location.pathname}${q}#return-to-work`);}catch{}
const menuToggle = document.querySelector('#menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu() { if (!menuToggle || !menu) return; menu.hidden = true; menuToggle.setAttribute('aria-expanded','false'); menuToggle.textContent = t('Menu'); }
menuToggle?.addEventListener('click', () => { const expanded = menuToggle.getAttribute('aria-expanded') !== 'true'; menu.hidden = !expanded; menuToggle.setAttribute('aria-expanded', String(expanded)); menuToggle.textContent = t(expanded ? 'Close' : 'Menu'); });
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu && !menu.hidden){closeMenu();menuToggle.focus();} });
matchMedia('(min-width:951px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
const media = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('#motion-toggle');
let paused = media.matches;
try { paused = media.matches || localStorage.getItem('maxbob-motion') === 'paused'; } catch {}
function setPaused(value, persist=false) {
 paused = value; root.classList.toggle('motion-paused', paused);
 if (motionToggle) {motionToggle.textContent = t(paused ? 'Enable motion' : 'Pause motion');motionToggle.setAttribute('aria-pressed', String(paused));}
 if(persist) try {localStorage.setItem('maxbob-motion', paused ? 'paused' : 'active');} catch {}
 window.dispatchEvent(new CustomEvent('portfolio-motion',{detail:{paused}}));
}
setPaused(paused);
motionToggle?.addEventListener('click',()=>setPaused(!paused,true));
let motionContext;
function configureAnimations() {
 motionContext?.revert();
 if(!window.gsap || !window.ScrollTrigger || paused) return;
 gsap.registerPlugin(ScrollTrigger);
 motionContext = gsap.context(() => {
  gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  // Only visual diagrams move. Reading and navigation never wait for a reveal.
  gsap.utils.toArray('.feature-visual .pipeline').forEach(el => gsap.from(el,{y:22,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'center center',scrub:.7}}));
  gsap.utils.toArray('.surface-grid').forEach(el => gsap.from(el,{y:20,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'center center',scrub:.7}}));
 });
}
configureAnimations();
window.addEventListener('portfolio-motion', configureAnimations);
media.addEventListener('change',e=>setPaused(e.matches));
window.addEventListener('load',()=>window.ScrollTrigger?.refresh());
window.addEventListener('portfolio-language',()=>{
 if(menuToggle)menuToggle.textContent=t(menuToggle.getAttribute('aria-expanded')==='true'?'Close':'Menu');
 if(motionToggle)motionToggle.textContent=t(paused?'Enable motion':'Pause motion');
 const status=document.querySelector('#copy-status');if(status)status.textContent='';
 window.ScrollTrigger?.refresh();
});
const visualSections = [...document.querySelectorAll('[data-visual]')];
if(visualSections.length) {
 new IntersectionObserver(entries => {
  entries.filter(e=>e.isIntersecting).forEach(entry => {
   document.body.dataset.phase = entry.target.dataset.phase;
   window.dispatchEvent(new CustomEvent('portfolio-scene',{detail:{mode:entry.target.dataset.visual,phase:entry.target.dataset.phase}}));
  });
 },{rootMargin:'-25% 0px -45% 0px',threshold:0}).observe(visualSections[0]);
 const sectionObserver = new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).forEach(entry=>{
   document.body.dataset.phase=entry.target.dataset.phase;
   window.dispatchEvent(new CustomEvent('portfolio-scene',{detail:{mode:entry.target.dataset.visual,phase:entry.target.dataset.phase}}));
  });
 },{rootMargin:'-25% 0px -45% 0px',threshold:0});
 visualSections.slice(1).forEach(el=>sectionObserver.observe(el));
}
document.querySelector('#copy-email')?.addEventListener('click', async () => {
 const status=document.querySelector('#copy-status');
 try {await navigator.clipboard.writeText('mazamaka603@gmail.com');status.textContent=t('Copied');}
 catch {status.textContent=t('Select the address to copy it.');}
});
// Preserve the exact project position when returning from an internal case study.
document.addEventListener('click',event=>{if(event.target.closest?.('a[href*="cases/"]')&&!document.body.classList.contains('case-page'))try{sessionStorage.setItem('maxbob-return-y',String(window.scrollY));sessionStorage.setItem('maxbob-return-search',location.search);}catch{}});
if(!document.body.classList.contains('case-page') && location.hash === '#return-to-work') {
 let y=0;try{y=Number(sessionStorage.getItem('maxbob-return-y'))||0;}catch{}
 window.addEventListener('load',()=>{window.scrollTo({top:y||document.querySelector('#work').offsetTop-100,behavior:'instant'});history.replaceState(null,'',`${location.pathname}${location.search}#work`);},{once:true});
}

// The AI systems illustration gently follows the pointer.
const paintedScene = document.querySelector('.painted-scene');
const paintedHero = document.querySelector('.hero');
if (paintedScene && paintedHero) {
 let targetX=0,targetY=0,x=0,y=0,frame=0,visible=true,lastTime=0;
 const finePointer=matchMedia('(pointer:fine)');
 const enabled=()=>!paused && finePointer.matches && visible && !document.hidden;
 function resetPaint(){cancelAnimationFrame(frame);frame=0;x=0;y=0;targetX=0;targetY=0;paintedScene.style.transform='';}
 function tickPaint(now){
  frame=0;if(!enabled()){resetPaint();return;}
  const delta=Math.min((now-lastTime)/1000,.05);lastTime=now;
  const follow=1-Math.exp(-delta*3);x+=(targetX-x)*follow;y+=(targetY-y)*follow;
  paintedScene.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
  if(Math.abs(targetX-x)>.02||Math.abs(targetY-y)>.02)frame=requestAnimationFrame(tickPaint);
 }
 function startPaint(){if(enabled()&&!frame){lastTime=performance.now();frame=requestAnimationFrame(tickPaint);}}
 paintedHero.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!enabled())return;const r=paintedHero.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*-12;targetY=((e.clientY-r.top)/r.height-.5)*-8;startPaint();},{passive:true});
 paintedHero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;startPaint();},{passive:true});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)resetPaint();},{threshold:0}).observe(paintedHero);
 window.addEventListener('portfolio-motion',()=>{resetPaint();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPaint();});
 window.addEventListener('pagehide',resetPaint);
}
