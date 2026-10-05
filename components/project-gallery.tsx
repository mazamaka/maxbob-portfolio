import * as React from "react";
import {useT,useLocale} from "@/src/i18n";
import {X,LockKeyhole,Star,SlidersHorizontal,ArrowUpRight,BookOpen,Globe,Workflow,AudioLines,ScanText,Bot,CodeXml,RefreshCw} from "lucide-react";
import {InteractiveTravelCard} from "@/components/ui/3d-card";
import {ProjectTags} from "@/components/project-tags";
import {ActionSearchBar,type Action} from "@/components/ui/action-search-bar";
import {projects,starsUpdatedAt} from "@/src/projects";
import {allProjects,searchHits,directions,stacks,highlightParts,type CatalogProject} from "@/src/search";
import {currentStars} from "@/src/github-stars";
import {useGitHubStars} from "@/src/use-github-stars";
function Highlight({text,query}:{text:string;query:string}){return <>{highlightParts(text,query).map((part,i)=>part.match?<mark key={i}>{part.text}</mark>:<React.Fragment key={i}>{part.text}</React.Fragment>)}</>;}
const interests=[{query:"Google",icon:Globe,detail:"Ads, Gmail, Sheets & AI integrations"},{query:"AI agents",icon:Bot,detail:"Tools, models & autonomous workflows"},{query:"browser automation",icon:Workflow,detail:"Playwright, CDP & browser profiles"},{query:"voice",icon:AudioLines,detail:"Realtime audio & assistants"},{query:"OCR",icon:ScanText,detail:"Document processing & extraction"}];
export function ProjectGallery(){
 const t=useT(),locale=useLocale();
 const githubStars=useGitHubStars();
 const checkedAt=githubStars.snapshot?.checkedAt??starsUpdatedAt;
 const [query,setQuery]=React.useState("");
 const [direction,setDirection]=React.useState("all"),[visibility,setVisibility]=React.useState("all"),[stack,setStack]=React.useState("all");
 const [browseAll,setBrowseAll]=React.useState(false),[ready,setReady]=React.useState(false),[filtersOpen,setFiltersOpen]=React.useState(false);
 const [selected,setSelected]=React.useState<CatalogProject|null>(null);
 const dialog=React.useRef<HTMLDialogElement>(null),resultRegion=React.useRef<HTMLDivElement>(null),previousFocus=React.useRef<HTMLElement|null>(null);
 const filterCount=Number(direction!=="all")+Number(visibility!=="all")+Number(stack!=="all");
 const active=!!query.trim()||filterCount>0||browseAll;
 const hits=React.useMemo(()=>searchHits(query,direction,visibility,stack).map(hit=>({...hit,project:{...hit.project,stars:currentStars(hit.project.repo,hit.project.stars,githubStars.snapshot)}})),[query,direction,visibility,stack,githubStars.snapshot]);
 React.useEffect(()=>{
  const p=new URLSearchParams(location.search);
  setQuery(p.get("q")??"");setDirection(directions.includes(p.get("direction")??"")?p.get("direction")!:"all");
  setVisibility(["public","private"].includes(p.get("access")??"")?p.get("access")!:"all");
  setStack(stacks.includes(p.get("stack")??"")?p.get("stack")!:"all");setBrowseAll(p.get("all")==="1");setReady(true);
 },[]);
 React.useEffect(()=>{
  if(!ready)return;const p=new URLSearchParams();
  if(query.trim())p.set("q",query.trim());if(direction!=="all")p.set("direction",direction);
  if(visibility!=="all")p.set("access",visibility);if(stack!=="all")p.set("stack",stack);if(browseAll)p.set("all","1");
  history.replaceState(null,"",`${location.pathname}${p.size?`?${p}`:""}${location.hash}`);
 },[query,direction,visibility,stack,browseAll,ready]);
 React.useEffect(()=>{if(selected){previousFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();}},[selected]);
 React.useEffect(()=>{if(ready){
  const gallery=document.getElementById("project-gallery");if(gallery)gallery.dataset.ready="true";
  window.dispatchEvent(new Event("portfolio-catalog-ready"));
 }},[ready]);
 function reset(){setQuery("");setDirection("all");setVisibility("all");setStack("all");setBrowseAll(false);}
 function explore(term:string){setQuery(term);setDirection("all");setVisibility("all");setStack("all");}
 function exploreTag(tag:string){
  previousFocus.current=null;
  dialog.current?.close();setSelected(null);
  explore(tag);setBrowseAll(false);
  history.replaceState(null,"",`${location.pathname}?q=${encodeURIComponent(tag)}#work`);
  requestAnimationFrame(()=>{
   resultRegion.current?.focus({preventScroll:true});
   const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches||document.documentElement.classList.contains("motion-paused");
   document.getElementById("work")?.scrollIntoView({block:"start",behavior:reduced?"instant":"smooth"});
  });
 }
 function showResults(){setBrowseAll(true);requestAnimationFrame(()=>{resultRegion.current?.focus({preventScroll:true});resultRegion.current?.scrollIntoView({behavior:"instant",block:"start"});});}
 function rememberPosition(){try{sessionStorage.setItem("maxbob-return-y",String(scrollY));sessionStorage.setItem("maxbob-return-search",location.search);}catch{}}
 const actions=React.useMemo<Action[]>(()=>query.trim()?hits.slice(0,5).map(hit=>({id:hit.project.id,label:hit.project.title,icon:hit.project.visibility==="private"?<LockKeyhole size={18}/>:<CodeXml size={18}/>,description:<Highlight text={t(hit.excerpt)} query={query}/>,end:t(hit.project.visibility==="private"?"Overview":"Project"),onSelect:()=>setSelected(hit.project)})):interests.map(item=>({id:item.query,label:t(item.query),icon:<item.icon size={18}/>,description:t(item.detail),end:String(searchHits(item.query).length),onSelect:()=>{setQuery(item.query);setDirection("all");setStack("all");setVisibility("all");}})),[query,hits]);
 return <div className="project-board">
  <div className="catalog-controls">
   <div className="search-toolbar"><ActionSearchBar query={query} onQueryChange={setQuery} actions={actions} disabled={!ready} resultCount={hits.length} onShowResults={showResults}/>
    <button className={`filter-toggle${filtersOpen?" is-open":""}`} aria-label={t("Filters")} aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={()=>setFiltersOpen(value=>!value)} disabled={!ready}><SlidersHorizontal size={18}/><span>{t("Filters")}</span>{filterCount>0&&<b>{filterCount}</b>}</button>
   </div>
   {filtersOpen&&<div className="catalog-filters" id="catalog-filters">
    <label><span>{t("Focus")}</span><select aria-label={t("Project focus")} value={direction} onChange={e=>setDirection(e.target.value)}><option value="all">{t("All disciplines")}</option>{directions.map(d=><option key={d} value={d}>{t(d)}</option>)}</select></label>
    <label><span>{t("Stack")}</span><select aria-label={t("Technology")} value={stack} onChange={e=>setStack(e.target.value)}><option value="all">{t("All technologies")}</option>{stacks.map(s=><option key={s}>{s}</option>)}</select></label>
    <label><span>{t("Code")}</span><select aria-label={t("Source availability")} value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="all">{t("Public & private")}</option><option value="public">{t("Public repositories")}</option><option value="private">{t("Private projects")}</option></select></label>
   </div>}
   {filterCount>0?<div className="active-filters" aria-label={t("Active filters")}>{direction!=="all"&&<button onClick={()=>setDirection("all")}>{t(direction)}<X size={13}/><span className="sr-only">{t("Remove focus filter")}</span></button>}{stack!=="all"&&<button onClick={()=>setStack("all")}>{stack}<X size={13}/><span className="sr-only">{t("Remove technology filter")}</span></button>}{visibility!=="all"&&<button onClick={()=>setVisibility("all")}>{t(visibility==="private"?"Private projects":"Public repositories")}<X size={13}/><span className="sr-only">{t("Remove availability filter")}</span></button>}</div>:<div className="search-caption"><span><BookOpen size={13}/> {t("Search inside the projects · EN / RU / UK")}</span><span className="search-examples">{t("Try")} {['Google','AI','OCR'].map(term=><button key={term} onClick={()=>explore(term)} disabled={!ready}>{term}</button>)}</span></div>}
  </div>
  <div className="catalog-status"><p role="status" aria-live="polite" aria-atomic="true">{active?<>{t(hits.length===1?"{count} project found":"{count} projects found",{count:hits.length})}{hits.length>0&&<span className="result-breakdown"> · {hits.filter(h=>h.project.visibility==="public").length} {t("public")} / {hits.filter(h=>h.project.visibility==="private").length} {t("private")}</span>}</>:<>{t("Selected work")} <span>· {t("Explore {count} projects",{count:allProjects.length})}</span></>}</p><button onClick={()=>active?reset():setBrowseAll(true)} disabled={!ready}>{t(active?"Back to selected":"Browse all projects")}<ArrowUpRight size={14}/></button></div>
  <div id="catalog-results" ref={resultRegion} tabIndex={-1} aria-label={t("Project results")}>
   {!active?<div className="p-grid">{projects.map(project=><InteractiveTravelCard key={project.title} {...project} stars={currentStars(project.repo,project.stars,githubStars.snapshot)} subtitle={t(project.category)} onTagSelect={ready?exploreTag:undefined} actionHref={project.caseHref??project.live??project.href} actionText={project.caseHref?(project.repo?"Read case study":"Project overview"):project.live?"Explore live project":"View on GitHub"}/>)}</div>
   :hits.length?<div className="catalog-list">{hits.map(({project,excerpt,matchedIn})=><article key={project.id} data-reading-anchor={`result:${project.id}`} className="catalog-result">
    <div><div className="result-meta"><span>{t(project.category)}</span><span>{project.visibility==="private"?<><LockKeyhole size={13} aria-hidden="true"/>{t("Private project")}</>:t("Public repository")}</span>{project.stars!==undefined&&<span aria-label={t("{count} total GitHub stars",{count:project.stars??0})}><Star size={13} aria-hidden="true"/>{project.stars}</span>}</div>
     <h3><Highlight text={project.title} query={query}/></h3><p><Highlight text={t(project.description)} query={query}/></p>
     {query.trim()&&excerpt!==project.description&&<div className="result-match"><BookOpen size={14}/><p><span>{t(matchedIn)}</span><Highlight text={t(excerpt)} query={query}/></p></div>}
     <ProjectTags tags={project.tags} label={t("{name} technologies",{name:project.title})} onSelect={exploreTag} renderTag={tag=><Highlight text={tag} query={query}/>}/></div>
    <div className="result-actions">{project.caseHref&&<a className="p-primary" href={project.caseHref} onClick={rememberPosition}>{t(project.visibility==="private"?"Project overview":"Read case study")}</a>}
     {project.visibility==="public"&&project.href&&<a className={project.caseHref?"p-source":"p-primary"} href={project.href} target="_blank" rel="noreferrer">{t("View on GitHub")}<ArrowUpRight size={14}/></a>}
     <button className={project.visibility==="private"&&!project.caseHref?"p-primary":"result-details"} onClick={()=>setSelected(project)}>{t(project.visibility==="private"&&!project.caseHref?"Project overview":"Project details")}</button>
     {project.live&&<a className="p-source" href={project.live} target="_blank" rel="noreferrer">{t("Visit product")}</a>}
    </div>
   </article>)}</div>:<div className="catalog-empty"><SearchEmpty/><h3>{t("No matching projects.")}</h3><p>{t(filterCount?"Try removing a filter or use a broader term.":"Try an integration, technology or task — Google, voice, OCR or browser automation.")}</p><button className="p-primary" onClick={reset}>{t("Reset search")}</button></div>}
  </div>
  <noscript><p className="catalog-nojs">{t("Search needs JavaScript. The selected projects and their links are available above.")}</p></noscript>
  <div className="p-gallery-note"><div className="stars-status"><span aria-live="polite" title={t(githubStars.status==="limited"?"GitHub is temporarily limiting requests. Showing the last available counts.":githubStars.status==="error"?"GitHub could not be reached. Showing the last available counts.":"Total public GitHub stars, including the repository owner's star.")}>{t("Total GitHub stars")} · {githubStars.refreshing?t("Checking…"):<>{t(githubStars.status==="live"?"Checked":"Saved")} <time dateTime={checkedAt}>{new Intl.DateTimeFormat(locale==="en"?"en-GB":locale==="uk"?"uk-UA":"ru-RU",githubStars.status==="live"?{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}:{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(checkedAt))}{githubStars.status==="live"?" UTC":""}</time></>}</span><button type="button" className="stars-refresh" onClick={githubStars.refresh} disabled={githubStars.refreshing} aria-label={t("Refresh GitHub stars")} title={t("Refresh GitHub stars")}><RefreshCw size={13} aria-hidden="true"/></button></div><a href="https://github.com/mazamaka?tab=repositories" target="_blank" rel="noreferrer">{t("All public repositories")}</a></div>
  <dialog ref={dialog} className="project-dialog" aria-labelledby="overview-title" onClose={()=>{setSelected(null);previousFocus.current?.focus();}} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}>
   {selected&&<><div className="overview-top"><span>{selected.visibility==="private"?<LockKeyhole size={15}/>:<CodeXml size={15}/>} {t(selected.visibility==="private"?"Private project":"Public project")}</span><button autoFocus aria-label={t("Close project overview")} onClick={()=>dialog.current?.close()}><X size={21}/></button></div>
    <p className="project-kicker">{t(selected.category)}</p><h2 id="overview-title">{selected.title}</h2><p className="overview-description">{t(selected.description)}</p>
    {!!selected.searchContent?.length&&<><h3>{t("Inside the project")}</h3><ul className="overview-content">{selected.searchContent.map(text=><li key={text}><Highlight text={t(text)} query={query}/></li>)}</ul></>}
    <h3>{t("Engineering focus")}</h3><ProjectTags tags={selected.tags} label={t("{name} technologies",{name:selected.title})} onSelect={exploreTag}/>
    {selected.visibility==="private"?<><p className="overview-note">{t("The implementation is private. I can discuss the architecture and my contribution without sharing source code or client data.")}</p><a className="p-primary" href={`mailto:mazamaka603@gmail.com?subject=${encodeURIComponent(`Let's discuss ${selected.title}`)}`}>{t("Discuss this project")}</a></>:<a className="p-primary" href={selected.href} target="_blank" rel="noreferrer">{t("Explore the source")}<ArrowUpRight size={15}/></a>}
    {selected.caseHref&&<a className="overview-case" href={selected.caseHref} onClick={rememberPosition}>{t(selected.visibility==="private"?"Read the project overview →":"Read the case study →")}</a>}
   </>}
  </dialog>
 </div>;
}
function SearchEmpty(){return <BookOpen size={30} strokeWidth={1.25} aria-hidden="true"/>;}
