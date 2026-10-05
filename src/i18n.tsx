import {createContext,useContext,type ReactNode} from 'react';
import ui from './locales/ui.json';
import content from './locales/catalog.json';
export type Locale='en'|'ru'|'uk';
const dictionary:Record<string,string[]>={...ui,...content};
const LocaleContext=createContext<Locale>('en');
export function translate(value:string,locale:Locale='en',params:Record<string,string|number>={}){
 const translated=locale==='en'?value:dictionary[value]?.[locale==='ru'?0:1]??value;
 return translated.replace(/\{(\w+)\}/g,(match,key)=>String(params[key]??match));
}
export function LocaleProvider({locale,children}:{locale:Locale;children:ReactNode}){return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;}
export const useLocale=()=>useContext(LocaleContext);
export function useT(){const locale=useLocale();return (value:string,params?:Record<string,string|number>)=>translate(value,locale,params);}
