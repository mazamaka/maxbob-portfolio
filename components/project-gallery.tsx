import * as React from "react";
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
 const actions=React.useMemo<Action[]>(()=>query.trim()?hits.slice(0,5).map(hit=>({id:hit.project.id,label:hit.project.title,icon:hit.project.visibility==="private"?<LockKeyhole size={18}/>:<CodeXml size={18}/>,description:<Highlight text={hit.excerpt} query={query}/>,end:hit.project.visibility==="private"?"Overview":"Project",onSelect:()=>setSelected(hit.project)})):interests.map(item=>({id:item.query,label:item.query,icon:<item.icon size={18}/>,description:item.detail,end:String(searchHits(item.query).length),onSelect:()=>{setQuery(item.query);setDirection("all");setStack("all");setVisibility("all");}})),[query,hits]);
 return <div className="project-board">
  <div className="catalog-controls">
   <div className="search-toolbar"><ActionSearchBar query={query} onQueryChange={setQuery} actions={actions} disabled={!ready} resultCount={hits.length} onShowResults={showResults}/>
    <button className={`filter-toggle${filtersOpen?" is-open":""}`} aria-label="Filters" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={()=>setFiltersOpen(value=>!value)} disabled={!ready}><SlidersHorizontal size={18}/><span>Filters</span>{filterCount>0&&<b>{filterCount}</b>}</button>
   </div>
   {filtersOpen&&<div className="catalog-filters" id="catalog-filters">
    <label><span>Focus</span><select aria-label="Project focus" value={direction} onChange={e=>setDirection(e.target.value)}><option value="all">All disciplines</option>{directions.map(d=><option key={d}>{d}</option>)}</select></label>
    <label><span>Stack</span><select aria-label="Technology" value={stack} onChange={e=>setStack(e.target.value)}><option value="all">All technologies</option>{stacks.map(s=><option key={s}>{s}</option>)}</select></label>
    <label><span>Code</span><select aria-label="Source availability" value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="all">Public & private</option><option value="public">Public repositories</option><option value="private">Private projects</option></select></label>
   </div>}
   {filterCount>0?<div className="active-filters" aria-label="Active filters">{direction!=="all"&&<button onClick={()=>setDirection("all")}>{direction}<X size={13}/><span className="sr-only">Remove focus filter</span></button>}{stack!=="all"&&<button onClick={()=>setStack("all")}>{stack}<X size={13}/><span className="sr-only">Remove technology filter</span></button>}{visibility!=="all"&&<button onClick={()=>setVisibility("all")}>{visibility==="private"?"Private projects":"Public repositories"}<X size={13}/><span className="sr-only">Remove availability filter</span></button>}</div>:<div className="search-caption"><span><BookOpen size={13}/> Search inside the projects · EN / RU</span><span className="search-examples">Try {['Google','AI','OCR'].map(term=><button key={term} onClick={()=>explore(term)} disabled={!ready}>{term}</button>)}</span></div>}
  </div>
  <div className="catalog-status"><p role="status" aria-live="polite" aria-atomic="true">{active?<><strong>{hits.length}</strong> {hits.length===1?"project":"projects"} found{hits.length>0&&<span className="result-breakdown"> · {hits.filter(h=>h.project.visibility==="public").length} public / {hits.filter(h=>h.project.visibility==="private").length} private</span>}</>:<>Selected work <span>· Explore {allProjects.length} projects</span></>}</p><button onClick={()=>active?reset():setBrowseAll(true)} disabled={!ready}>{active?"Back to selected":"Browse all projects"}<ArrowUpRight size={14}/></button></div>
  <div id="catalog-results" ref={resultRegion} tabIndex={-1} aria-label="Project results">
   {!active?<div className="p-grid">{projects.map(project=><InteractiveTravelCard key={project.title} {...project} stars={currentStars(project.repo,project.stars,githubStars.snapshot)} subtitle={project.category} onTagSelect={ready?exploreTag:undefined} actionHref={project.caseHref??project.live??project.href} actionText={project.caseHref?(project.repo?"Read case study":"Project overview"):project.live?"Explore live project":"View on GitHub"}/>)}</div>
   :hits.length?<div className="catalog-list">{hits.map(({project,excerpt,matchedIn})=><article key={project.id} className="catalog-result">
    <div><div className="result-meta"><span>{project.category}</span><span>{project.visibility==="private"?<><LockKeyhole size={13} aria-hidden="true"/>Private project</>:"Public repository"}</span>{project.stars!==undefined&&<span aria-label={`${project.stars} GitHub stars`}><Star size={13} aria-hidden="true"/>{project.stars}</span>}</div>
     <h3><Highlight text={project.title} query={query}/></h3><p><Highlight text={project.description} query={query}/></p>
     {query.trim()&&excerpt!==project.description&&<div className="result-match"><BookOpen size={14}/><p><span>{matchedIn}</span><Highlight text={excerpt} query={query}/></p></div>}
     <ProjectTags tags={project.tags} label={`${project.title} technologies`} onSelect={exploreTag} renderTag={tag=><Highlight text={tag} query={query}/>}/></div>
    <div className="result-actions">{project.caseHref&&<a className="p-primary" href={project.caseHref} onClick={rememberPosition}>{project.visibility==="private"?"Project overview":"Read case study"}</a>}
     {project.visibility==="public"&&project.href&&<a className={project.caseHref?"p-source":"p-primary"} href={project.href} target="_blank" rel="noreferrer">View on GitHub<ArrowUpRight size={14}/></a>}
     <button className={project.visibility==="private"&&!project.caseHref?"p-primary":"result-details"} onClick={()=>setSelected(project)}>{project.visibility==="private"&&!project.caseHref?"Project overview":"Project details"}</button>
     {project.live&&<a className="p-source" href={project.live} target="_blank" rel="noreferrer">Visit product</a>}
    </div>
   </article>)}</div>:<div className="catalog-empty"><SearchEmpty/><h3>No matching projects.</h3><p>{filterCount?"Try removing a filter or use a broader term.":"Try an integration, technology or task — Google, voice, OCR or browser automation."}</p><button className="p-primary" onClick={reset}>Reset search</button></div>}
  </div>
  <noscript><p className="catalog-nojs">Search needs JavaScript. The selected projects and their links are available above.</p></noscript>
  <div className="p-gallery-note"><div className="stars-status"><span aria-live="polite" title={githubStars.status==="limited"?"GitHub is temporarily limiting requests. Showing the last available counts.":githubStars.status==="error"?"GitHub could not be reached. Showing the last available counts.":"Total public GitHub stars, including the repository owner's star."}>Total GitHub stars · {githubStars.refreshing?"Checking…":<>{githubStars.status==="live"?"Checked":"Saved"} <time dateTime={checkedAt}>{new Intl.DateTimeFormat("en-GB",githubStars.status==="live"?{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}:{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(checkedAt))}{githubStars.status==="live"?" UTC":""}</time></>}</span><button type="button" className="stars-refresh" onClick={githubStars.refresh} disabled={githubStars.refreshing} aria-label="Refresh GitHub stars" title="Refresh GitHub stars"><RefreshCw size={13} aria-hidden="true"/></button></div><a href="https://github.com/mazamaka?tab=repositories" target="_blank" rel="noreferrer">All public repositories</a></div>
  <dialog ref={dialog} className="project-dialog" aria-labelledby="overview-title" onClose={()=>{setSelected(null);previousFocus.current?.focus();}} onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}>
   {selected&&<><div className="overview-top"><span>{selected.visibility==="private"?<LockKeyhole size={15}/>:<CodeXml size={15}/>} {selected.visibility==="private"?"Private project":"Public project"}</span><button autoFocus aria-label="Close project overview" onClick={()=>dialog.current?.close()}><X size={21}/></button></div>
    <p className="project-kicker">{selected.category}</p><h2 id="overview-title">{selected.title}</h2><p className="overview-description">{selected.description}</p>
    {!!selected.searchContent?.length&&<><h3>Inside the project</h3><ul className="overview-content">{selected.searchContent.map(text=><li key={text}><Highlight text={text} query={query}/></li>)}</ul></>}
    <h3>Engineering focus</h3><ProjectTags tags={selected.tags} label={`${selected.title} technologies`} onSelect={exploreTag}/>
    {selected.visibility==="private"?<><p className="overview-note">The implementation is private. I can discuss the architecture and my contribution without sharing source code or client data.</p><a className="p-primary" href={`mailto:mazamaka603@gmail.com?subject=${encodeURIComponent(`Let's discuss ${selected.title}`)}`}>Discuss this project</a></>:<a className="p-primary" href={selected.href} target="_blank" rel="noreferrer">Explore the source<ArrowUpRight size={15}/></a>}
    {selected.caseHref&&<a className="overview-case" href={selected.caseHref} onClick={rememberPosition}>{selected.visibility==="private"?"Read the project overview →":"Read the case study →"}</a>}
   </>}
  </dialog>
 </div>;
}
function SearchEmpty(){return <BookOpen size={30} strokeWidth={1.25} aria-hidden="true"/>;}
