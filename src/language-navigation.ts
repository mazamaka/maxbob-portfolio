// Apply bundled translations without replacing the document or restarting its UI.
import type {Locale} from './i18n';
type Binding={text?:string[];attrs?:Record<string,string|null>};
type PageTranslations={page:string;locales:Record<Locale,Record<string,Binding>>};
const anchors='[data-reading-anchor], main section[id], .directory-entry[id], .case-hero, .directory-intro, .focus-strip, footer[id]';
type Position={id:string;key:string;section:string;top:number;fraction:number|null;y:number};
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

function restorePosition(p:Position){
 const rect=findAnchor(p)?.getBoundingClientRect();
 const top=p.y<8?0:rect?scrollY+rect.top-(p.fraction===null?p.top:readingLine()-rect.height*p.fraction):p.y;
 window.scrollTo({top:Math.max(0,top),behavior:'instant'});
}
export function initializeLanguageNavigation(){
 const source=document.getElementById('page-translations');
 if(!source)return; // Native language links remain a fallback without the bundle.
 const data=JSON.parse(source.textContent??'{}') as PageTranslations;
 const nodes=new Map([...document.querySelectorAll<HTMLElement>('[data-i18n-node]')].map(el=>[el.dataset.i18nNode!,el]));
 const picker=document.querySelector<HTMLDetailsElement>('.language-picker'),summary=picker?.querySelector('summary');
 let queued:{locale:Locale;updateURL:boolean}|null=null;
 const ready=()=>!document.getElementById('project-gallery')||document.getElementById('project-gallery')?.dataset.ready==='true';
 function refreshLinks(){picker?.querySelectorAll<HTMLAnchorElement>('[data-locale-link]').forEach(link=>{
  const target=new URL(link.href);target.search=location.search;target.hash=location.hash;link.href=target.pathname+target.search+target.hash;
 });}
 function applyLocale(locale:Locale,updateURL=true){
  if(!data.locales[locale])return;
  if(document.documentElement.lang===locale){queued=null;return;}
  if(!ready()){queued={locale,updateURL};return;}
  queued=null;
  const position=capturePosition(),root=document.documentElement,oldAnchor=root.style.overflowAnchor;
  root.style.overflowAnchor='none';
  // One synchronous update, including React, completes before the next browser paint.
  for(const [key,binding] of Object.entries(data.locales[locale])){
   const element=nodes.get(key);if(!element)continue;
   if(binding.text){
    const texts=[...element.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE);
    binding.text.forEach((value,index)=>{if(texts[index])texts[index].textContent=value;});
   }
   for(const [name,value] of Object.entries(binding.attrs??{})){
    if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);
   }
  }
  root.lang=locale;
  if(updateURL)history.replaceState(history.state,'',`${locale==='en'?'':'/'+locale}${data.page}${location.search}${location.hash}`);
  window.dispatchEvent(new CustomEvent('portfolio-language',{detail:{locale}}));
  refreshLinks();
  restorePosition(position);
  requestAnimationFrame(()=>{root.style.overflowAnchor=oldAnchor;});
 }
 window.addEventListener('portfolio-catalog-ready',()=>queueMicrotask(()=>{
  if(queued)applyLocale(queued.locale,queued.updateURL);
 }));
 // Back/Forward between older anchor entries must also agree with the URL language.
 window.addEventListener('popstate',()=>{
  const match=location.pathname.match(/^\/(ru|uk)(?=\/)/),locale=(match?.[1]??'en') as Locale;
  const page=location.pathname.replace(/^\/(ru|uk)(?=\/)/,'');
  if(page===data.page)applyLocale(locale,false);
 });
 summary?.addEventListener('click',refreshLinks);
 picker?.addEventListener('toggle',()=>{summary?.setAttribute('aria-expanded',String(picker.open));if(picker.open)refreshLinks();});
 picker?.addEventListener('click',event=>{
  const link=(event.target as Element).closest<HTMLAnchorElement>('[data-locale-link]');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const locale=link.dataset.localeLink as Locale;
  if(!data.locales[locale])return;
  event.preventDefault();event.stopPropagation();picker.open=false;
  summary?.focus({preventScroll:true});applyLocale(locale);
 });
 document.addEventListener('pointerdown',event=>{if(picker&&!picker.contains(event.target as Node))picker.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker?.open){picker.open=false;summary?.focus({preventScroll:true});}});
 window.addEventListener('pagehide',()=>{if(picker)picker.open=false;});
}
