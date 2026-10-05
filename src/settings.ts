import {initializeLanguageNavigation} from './language-navigation';
import translations from './locales/ui.json';
const dictionary=translations as Record<string,string[]>;
const root=document.documentElement;
const t=(value:string)=>root.lang==='en'?value:dictionary[value]?.[root.lang==='ru'?0:1]??value;
Object.assign(window,{portfolioI18n:{get locale(){return root.lang;},t}});
const toggle=document.querySelector<HTMLButtonElement>('#theme-toggle');
function updateThemeLabel(){
 const label=t(root.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme');
 toggle?.setAttribute('aria-label',label);toggle?.setAttribute('title',label);toggle?.setAttribute('aria-pressed',String(root.dataset.theme==='dark'));
}
function setTheme(theme:string,persist=false){
 root.dataset.theme=theme==='dark'?'dark':'light';
 root.style.colorScheme=root.dataset.theme;updateThemeLabel();
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
window.addEventListener('portfolio-language',updateThemeLabel);
initializeLanguageNavigation();
