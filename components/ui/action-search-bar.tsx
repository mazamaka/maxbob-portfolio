"use client";
import * as React from "react";
import {useT} from "@/src/i18n";
import {AnimatePresence,motion,useReducedMotion} from "framer-motion";
import {Search,X,ArrowUpRight,CornerDownLeft,Command} from "lucide-react";
import {Input} from "@/components/ui/input";

export interface Action {id:string;label:string;icon:React.ReactNode;description?:React.ReactNode;end?:string;onSelect:()=>void;}
interface ActionSearchBarProps {query:string;onQueryChange:(query:string)=>void;actions:Action[];disabled?:boolean;resultCount:number;onShowResults:()=>void;}
// Adapted from the supplied action-search-bar. The caller supplies real project results.
export function ActionSearchBar({query,onQueryChange,actions,disabled,resultCount,onShowResults}:ActionSearchBarProps){
 const t=useT();
 const [open,setOpen]=React.useState(false),[active,setActive]=React.useState(-1);
 const [placement,setPlacement]=React.useState({side:"below",height:440});
 const input=React.useRef<HTMLInputElement>(null),root=React.useRef<HTMLDivElement>(null);
 const reduced=useReducedMotion();
 React.useEffect(()=>{setActive(-1);},[query,actions]);
 React.useEffect(()=>{
  if(!open)return;
  const position=()=>{const rect=input.current?.getBoundingClientRect();if(!rect)return;const below=innerHeight-rect.bottom-25,above=rect.top-115;const side=below<250&&above>below?"above":"below";setPlacement({side,height:Math.max(150,Math.min(440,side==="above"?above:below))});};
  position();window.addEventListener("resize",position);window.addEventListener("scroll",position,true);
  return()=>{window.removeEventListener("resize",position);window.removeEventListener("scroll",position,true);};
 },[open]);
 React.useEffect(()=>{if(open&&active>=0)document.getElementById(`suggestion-${actions[active]?.id}`)?.scrollIntoView({block:"nearest",behavior:"instant"});},[active,open,actions]);
 React.useEffect(()=>{
  const keyboard=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"&&!document.querySelector('dialog[open]')){e.preventDefault();input.current?.focus();input.current?.scrollIntoView({block:"center",behavior:"instant"});setOpen(true);}};
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};
  document.addEventListener("keydown",keyboard);document.addEventListener("pointerdown",outside);
  return()=>{document.removeEventListener("keydown",keyboard);document.removeEventListener("pointerdown",outside);};
 },[]);
 function choose(action:Action){setOpen(false);action.onSelect();}
 return <div className="action-search" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <div className="action-search-field">
   <Search size={21} aria-hidden="true"/>
   <label htmlFor="project-search" className="sr-only">{t("Search projects")}</label>
   <Input id="project-search" ref={input} role="combobox" aria-label={t("Search projects")} aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={open} aria-controls="project-suggestions" aria-activedescendant={open&&active>=0&&actions[active]?`suggestion-${actions[active].id}`:undefined}
    type="search" autoComplete="off" spellCheck={false} placeholder={t("Find a project, tool or integration…")} value={query} disabled={disabled}
    onChange={e=>{onQueryChange(e.target.value);setOpen(true);setActive(-1);}} onFocus={()=>setOpen(true)}
    onKeyDown={e=>{
     if(e.key==="Escape"){e.preventDefault();e.stopPropagation();setOpen(false);setActive(-1);}
     if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setOpen(true);setActive(i=>actions.length?(e.key==="ArrowDown"?(i+1)%actions.length:(i<=0?actions.length-1:i-1)):-1);}
     if(e.key==="Enter"){e.preventDefault();if(open&&active>=0&&actions[active])choose(actions[active]);else{setOpen(false);onShowResults();}}
    }}/>
   {query?<button className="search-clear" aria-label={t("Clear search")} onClick={()=>{onQueryChange("");input.current?.focus();setOpen(true);}}><X size={17}/></button>:<kbd aria-hidden="true"><Command size={12}/> K</kbd>}
  </div>
  <AnimatePresence>{open&&!disabled&&<motion.div className="action-dropdown" data-placement={placement.side} style={{maxHeight:placement.height}} initial={{opacity:0,y:reduced?0:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:3}} transition={{duration:reduced?0:.16}}>
   <div className="suggestion-heading"><span>{t(query.trim()?"QUICK MATCHES":"EXPLORE BY INTEREST")}</span><span>{query.trim()?t("{count} found",{count:resultCount}):"EN / RU / UK"}</span></div>
   <ul id="project-suggestions" role="listbox" aria-label={t("Project suggestions")}>
    {actions.map((action,i)=><li id={`suggestion-${action.id}`} role="option" aria-selected={i===active} key={action.id} className={i===active?"suggestion active":"suggestion"} onPointerDown={e=>e.preventDefault()} onMouseEnter={()=>setActive(i)} onClick={()=>choose(action)}>
      <span className="suggestion-icon" aria-hidden="true">{action.icon}</span><span className="suggestion-copy"><strong>{action.label}</strong>{action.description&&<small>{action.description}</small>}</span><span className="suggestion-end">{action.end}<ArrowUpRight size={14}/></span>
    </li>)}
   </ul>
   {!actions.length&&<p className="suggestion-empty">{t("No matches yet. Try Google, voice or browser automation.")}</p>}
   <div className="suggestion-footer"><span><CornerDownLeft size={12}/> {t("Enter to explore")} <i>·</i> {t("Esc to close")}</span><button onClick={()=>{setOpen(false);onShowResults();}}>{query.trim()?t("View {count} results",{count:resultCount}):t("Browse all projects")}<ArrowUpRight size={14}/></button></div>
  </motion.div>}</AnimatePresence>
 </div>;
}
