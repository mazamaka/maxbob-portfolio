import {useSyncExternalStore,type ImgHTMLAttributes} from 'react';
const subscribe=(notify:()=>void)=>{window.addEventListener('portfolio-theme',notify);return()=>window.removeEventListener('portfolio-theme',notify);};
const snapshot=()=>document.documentElement.dataset.theme==='dark';
const serverSnapshot=()=>false;
export function ThemeImage({nightSrc,...props}:ImgHTMLAttributes<HTMLImageElement>&{nightSrc:string}){
 const dark=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
 return <picture><source srcSet={nightSrc} media={dark?'all':'not all'}/><img {...props}/></picture>;
}
