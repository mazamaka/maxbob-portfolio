import translations from './locales/ui.json';
const dictionary=translations as Record<string,string[]>;
const root=document.documentElement;
const locale=['ru','uk'].includes(root.lang)?root.lang:'en';
const t=(value:string)=>locale==='en'?value:dictionary[value]?.[locale==='ru'?0:1]??value;
Object.assign(window,{portfolioI18n:{locale,t}});
const toggle=document.querySelector<HTMLButtonElement>('#theme-toggle');
function setTheme(theme:string,persist=false){
 root.dataset.theme=theme==='dark'?'dark':'light';
 root.style.colorScheme=root.dataset.theme;
 const label=t(root.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme');
 toggle?.setAttribute('aria-label',label);toggle?.setAttribute('title',label);toggle?.setAttribute('aria-pressed',String(root.dataset.theme==='dark'));
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',root.dataset.theme==='dark'?'#171e1a':'#f9f7ef');
 document.querySelectorAll<HTMLImageElement>('img[data-night-src]').forEach(img=>{
  if(!img.dataset.daySrc)img.dataset.daySrc=img.getAttribute('src')!;
  img.src=root.dataset.theme==='dark'?img.dataset.nightSrc!:img.dataset.daySrc;
 });
 if(persist)try{localStorage.setItem('maxbob-theme',root.dataset.theme);}catch{}
 window.dispatchEvent(new Event('portfolio-theme'));
}
setTheme(root.dataset.theme??'light');
toggle?.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark',true));
window.addEventListener('storage',event=>{if(event.key==='maxbob-theme')setTheme(event.newValue??'light');});
const picker=document.querySelector<HTMLDetailsElement>('.language-picker');
const summary=picker?.querySelector('summary');
function refreshLanguageLinks(){document.querySelectorAll<HTMLAnchorElement>('[data-locale-link]').forEach(link=>{
 const target=new URL(link.href);target.search=location.search;target.hash=location.hash;link.href=target.pathname+target.search+target.hash;
});}
summary?.addEventListener('click',refreshLanguageLinks);
picker?.addEventListener('toggle',()=>{summary?.setAttribute('aria-expanded',String(picker.open));if(picker.open)refreshLanguageLinks();});
document.addEventListener('pointerdown',event=>{if(picker&&!picker.contains(event.target as Node))picker.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker?.open){picker.open=false;summary?.focus();}});
