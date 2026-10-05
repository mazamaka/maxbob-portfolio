// Keep the reader at the same content when translated text changes page height.
const storageKey='maxbob-language-position';
const anchors='[data-reading-anchor], main section[id], .directory-entry[id], .case-hero, .directory-intro, .focus-strip, footer[id]';
type Position={id:string;key:string;section:string;top:number;fraction:number|null;y:number};
type Transition={to:string;hash:string;at:number;position:Position};
const readingLine=()=>Math.max(0,document.querySelector('.site-header')?.getBoundingClientRect().bottom??0)+24;
function anchorKey(element:HTMLElement){
 return element.dataset.readingAnchor??['case-hero','directory-intro','focus-strip'].find(name=>element.classList.contains(name))??'';
}
function capturePosition():Position{
 const line=readingLine();
 const candidates=[...document.querySelectorAll<HTMLElement>(anchors)].map(element=>({element,rect:element.getBoundingClientRect()}))
  .filter(({rect})=>rect.height>0&&rect.bottom>line+64&&rect.top<innerHeight);
 // Ignore a previous section's trailing sliver and use the nearby card, not its tall parent.
 const nearby=candidates.filter(parent=>!candidates.some(child=>child!==parent&&
  parent.element.contains(child.element)&&child.rect.top<=line+160));
 nearby.sort((a,b)=>Math.max(0,a.rect.top-line)-Math.max(0,b.rect.top-line)||a.rect.height-b.rect.height);
 const item=nearby[0];
 return {id:item?.element.id??'',key:item?anchorKey(item.element):'',section:item?.element.closest('section[id],footer[id]')?.id??'',
  top:item?.rect.top??0,fraction:item&&item.rect.top<line?(line-item.rect.top)/item.rect.height:null,y:scrollY};
}
function findAnchor(position:Position){
 return (position.id?document.getElementById(position.id):null)
  ??[...document.querySelectorAll<HTMLElement>(anchors)].find(element=>anchorKey(element)===position.key&&position.key!=='')
  ??(position.section?document.getElementById(position.section):null);
}
function takeTransition():Transition|null{
 try{
  const raw=sessionStorage.getItem(storageKey);sessionStorage.removeItem(storageKey);
  if(!raw)return null;
  const value=JSON.parse(raw) as Transition;
  if(value.to!==location.pathname+location.search||Date.now()-value.at>30_000||Date.now()<value.at)return null;
  const p=value.position;
  if(typeof value.hash!=='string'||(value.hash!==''&&!value.hash.startsWith('#'))||!p||
    ![p.id,p.key,p.section].every(x=>typeof x==='string')||![p.y,p.top].every(Number.isFinite)||
    (p.fraction!==null&&(!Number.isFinite(p.fraction)||p.fraction<0||p.fraction>1)))return null;
  return value;
 }catch{return null;}
}
function restoreTransition(transition:Transition){
 const oldRestoration=history.scrollRestoration;
 history.scrollRestoration='manual';
 let stopped=false,restored=false,frame=0;
 const stop=()=>{
  if(stopped)return;stopped=true;cancelAnimationFrame(frame);clearTimeout(deadline);
  history.scrollRestoration=oldRestoration;
  for(const event of ['wheel','touchstart','pointerdown','keydown'])window.removeEventListener(event,stop,true);
  window.removeEventListener('load',settle);window.removeEventListener('pagehide',stop);
  window.removeEventListener('portfolio-catalog-ready',catalogReady);document.removeEventListener('DOMContentLoaded',attempt);
 };
 const restore=()=>{
  const p=transition.position,element=findAnchor(p),rect=element?.getBoundingClientRect();
  const top=p.y<8?0:rect?scrollY+rect.top-(p.fraction===null?p.top:readingLine()-rect.height*p.fraction):p.y;
  window.scrollTo({top:Math.max(0,top),behavior:'instant'});
  // replaceState preserves the shareable fragment without triggering anchor scrolling.
  if(!restored)history.replaceState(history.state,'',transition.to+transition.hash);
  restored=true;
 };
 const ready=()=>document.readyState!=='loading'&&(!document.getElementById('project-gallery')||document.getElementById('project-gallery')?.dataset.ready==='true');
 const attempt=()=>{if(!stopped&&ready())restore();};
 const settle=()=>{void document.fonts.ready.then(()=>{
  if(stopped||!ready())return;
  frame=requestAnimationFrame(()=>{if(!stopped){restore();stop();}});
 });};
 const catalogReady=()=>{attempt();if(document.readyState==='complete')settle();};
 const deadline=window.setTimeout(()=>{if(!stopped){restore();stop();}},4000);
 for(const event of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(event,stop,{capture:true,passive:true});
 window.addEventListener('pagehide',stop,{once:true});
 document.addEventListener('DOMContentLoaded',attempt,{once:true});
 window.addEventListener('portfolio-catalog-ready',catalogReady,{once:true});
 window.addEventListener('load',settle,{once:true});
 attempt();if(document.readyState==='complete')settle();
}
export function initializeLanguageNavigation(){
 const pending=takeTransition();if(pending)restoreTransition(pending);
 const picker=document.querySelector<HTMLDetailsElement>('.language-picker'),summary=picker?.querySelector('summary');
 function refreshLinks(){picker?.querySelectorAll<HTMLAnchorElement>('[data-locale-link]').forEach(link=>{
  const target=new URL(link.href);target.search=location.search;target.hash=location.hash;link.href=target.pathname+target.search+target.hash;
 });}
 summary?.addEventListener('click',refreshLinks);
 picker?.addEventListener('toggle',()=>{summary?.setAttribute('aria-expanded',String(picker.open));if(picker.open)refreshLinks();});
 picker?.addEventListener('click',event=>{
  const link=(event.target as Element).closest<HTMLAnchorElement>('[data-locale-link]');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();event.stopPropagation();
  const target=new URL(link.href);target.search=location.search;target.hash=location.hash;
  if(target.origin!==location.origin)return;
  picker.open=false;
  if(target.pathname===location.pathname){summary?.focus({preventScroll:true});return;}
  const position=capturePosition();
  const transition:Transition={to:target.pathname+target.search,hash:target.hash,at:Date.now(),position};
  try{
   sessionStorage.setItem(storageKey,JSON.stringify(transition));
   // Do not let a stale #work or another old fragment move the new document first.
   location.assign(transition.to);
  }catch{
   // If storage is blocked, land at the currently visible section, never an old hash.
   target.hash=position.y<8?'':position.id||position.section;
   location.assign(target.href);
  }
 });
 document.addEventListener('pointerdown',event=>{if(picker&&!picker.contains(event.target as Node))picker.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker?.open){picker.open=false;summary?.focus({preventScroll:true});}});
 window.addEventListener('pagehide',()=>{if(picker)picker.open=false;});
}
