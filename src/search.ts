import catalog from "./catalog.json";
import {translate} from "./i18n";
import { projects } from "./projects";
export interface CatalogProject {
  id:string; title:string; description:string; category:string; tags:string[];
  visibility:"public"|"private"; repo?:string; href?:string; stars?:number;
  keywords?:string; overview?:string; live?:string; caseHref?:string;
  aliases?:string[]; searchContent?:string[];
}
const records=catalog.projects as CatalogProject[];
const key=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,"");
export const allProjects:CatalogProject[]=[
  ...projects.map(feature=>{
    const record=records.find(item=>feature.repo?item.repo===feature.repo:key(item.title)===key(feature.title));
    if(!record)throw new Error(`Missing catalog record: ${feature.title}`);
    return {...record,title:feature.title,description:feature.description,tags:[...new Set([...feature.tags,...record.tags])],live:feature.live,caseHref:feature.caseHref};
  }),
  ...records.filter(item=>!projects.some(feature=>feature.repo?item.repo===feature.repo:key(item.title)===key(feature.title)))
];
export const directions=["AI & agents","Automation","Antifraud","Backend & ops","Data & bots","Markets & Web3"];
export function projectDirections(project:CatalogProject){
  const value=`${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase(), result=new Set([project.category]);
  if(/agent|llm|mcp|\bai\b|ocr|semantic|voice|claude|openai|embedding|zero-shot/.test(value))result.add("AI & agents");
  if(/automat|workflow|browser|playwright|selenium|adb|temporal|rpa/.test(value))result.add("Automation");
  if(/fingerprint|antifraud|cloaking|ip reputation|tls/.test(value))result.add("Antifraud");
  if(/api|backend|docker|monitor|deploy|postgres|mysql|rabbitmq|systemd|infra|temporal/.test(value))result.add("Backend & ops");
  if(/telegram|collect|data|bot|ingest|scrap|parser|ocr|pipeline/.test(value))result.add("Data & bots");
  return [...result];
}
const groups=[
  ["google","гугл","гуглe"],["gemini","джемини"],["gmail","джимейл"],["sheets","таблицы","таблиц"],["ads","реклама","рекламы"],
  ["python","питон","пайтон"],["postgresql","postgres","постгрес"],["telegram","телеграм","телеграмм"],
  ["bot","bots","бот","боты","ботов"],["ai","llm","нейросеть","нейросети","нейронки","нейромережі","ші","ии","claude","openai","gemini"],
  ["agents","agent","агент","агенты","агентов","агентів"],["call","calls","calling"],["automation","automated","автоматизация","автоматизации","автоматизація","автоматизації","rpa"],
  ["antifraud","антифрод","антифрода","antidetect","антидетект"],["fingerprint","fingerprinting","фингерпринт","отпечаток","отпечатки","фінгерпринтинг","відбиток","відбитки","відбитків"],
  ["browser","browsers","браузер","браузеры","браузера","браузеров"],["monitoring","monitor","мониторинг","мониторинга","моніторинг","observability"],
  ["voice","голос","голосовой","голосовые","голосовий","голосові"],["ocr","распознавание","documents","документы","документов","розпізнавання","документи","документів"],
  ["queue","queued","queues","очереди","очередь","черга","черги","rabbitmq","celery"],
  ["collect","collection","scraper","scraping","parser","парсинг","парсер","сбор","збір","збору"],
  ["semantic","семантический","семантического","семантичний","embeddings","pgvector"],
  ["deployment","deploy","devops","деплой"],["frontend","фронтенд","react","swiftui"],
  ["backend","бэкенд","бекенд","бекэнд"],["data","данные","данных","дані","даних"],["docker","докер"],
  ["trading","торговля","трейдинг","web3","blockchain","блокчейн"]
];
export const normalize=(value:string)=>value.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^\p{L}\p{N}+#.]+/gu," ").trim();
const exactTechnologies=new Set(["react","swiftui","rabbitmq","celery","pgvector","embeddings","web3","blockchain","llm","ocr","rpa","claude","openai","gemini"]);
const stopWords=new Set(["the","a","an","with","for","and","in","on","по","для","с","и","на","опыт","проекты","проект","проєкти","проєкт","досвід","і","та","з","experience","projects"]);
export const queryTerms=(query:string)=>normalize(query).split(/\s+/).filter(token=>token&&!stopWords.has(token));
const alternatives=(term:string)=>exactTechnologies.has(term)?[term]:(groups.find(group=>group.includes(term))??[term]);
function matchesWord(part:string,term:string){return term.length<=2?part===term:part.startsWith(term);}
export function matchesTerm(text:string,term:string){
 const words=normalize(text).split(" ");
 return alternatives(term).some(alt=>words.some(word=>matchesWord(word,normalize(alt))));
}
export function highlightParts(text:string,query:string){
 const terms=queryTerms(query);
 return text.split(/([\p{L}\p{N}+#.]+)/u).filter(Boolean).map(text=>({text,match:terms.some(term=>matchesTerm(text,term))}));
}
export interface SearchHit {project:CatalogProject; score:number; excerpt:string; matchedIn:string;}
// Prepared once: search never downloads source or queries GitHub as the visitor types.
const index=allProjects.map(project=>({project,fields:[
 {label:"Project name",text:project.title,weight:12},
 ...(project.aliases??[]).map(text=>({label:"Also known as",text,weight:6})),
 ...project.tags.map(text=>({label:"Technology",text,weight:8})),
 {label:"Project summary",text:project.description,weight:6},
 ...(project.searchContent??[]).map(text=>({label:"Inside the project",text,weight:5})),
 ...(project.overview?[{label:"Project overview",text:project.overview,weight:3}]:[]),
 {label:"Engineering focus",text:projectDirections(project).join(" "),weight:2},
 {label:"Related terms",text:project.keywords??"",weight:1},
].map(field=>({...field,normalized:normalize([field.text,translate(field.text,"ru"),translate(field.text,"uk")].join(" "))}))}));
export function searchHits(query:string,direction="all",visibility="all",stack="all"):SearchHit[]{
 const terms=queryTerms(query), phrase=normalize(query);
 return index.flatMap(({project,fields})=>{
  if(direction!=="all"&&!projectDirections(project).includes(direction))return [];
  if(visibility!=="all"&&project.visibility!==visibility)return [];
  if(stack!=="all"&&!project.tags.some(tag=>normalize(tag)===normalize(stack)))return [];
  if(!terms.every(term=>fields.some(field=>matchesTerm(field.normalized,term))))return [];
  const scored=fields.map(field=>({...field,hits:terms.filter(term=>matchesTerm(field.normalized,term)).length}));
  const score=terms.reduce((total,term)=>total+Math.max(0,...fields.filter(field=>matchesTerm(field.normalized,term)).map(field=>field.weight)),0)
   +Math.min(3,scored.filter(field=>field.hits>0).length)
   +(phrase&&normalize(project.title)===phrase?100:0)
   +(phrase&&project.aliases?.some(alias=>normalize(alias)===phrase)?50:0);
  // Prefer a useful content sentence to a lone tag when it explains the same match.
  const detail=scored.filter(field=>field.hits>0&&["Inside the project","Project overview","Project summary"].includes(field.label)).sort((a,b)=>b.hits-a.hits||b.weight-a.weight)[0];
  const best=detail??scored.filter(field=>field.hits>0).sort((a,b)=>b.hits-a.hits||b.weight-a.weight)[0];
  return [{project,score,excerpt:best?.text??project.description,matchedIn:best?.label??"Project summary"}];
 }).sort((a,b)=>b.score-a.score);
}
export function searchProjects(query:string,direction="all",visibility="all",stack="all"){
 return searchHits(query,direction,visibility,stack).map(hit=>hit.project);
}
export const stacks=[...new Set(allProjects.flatMap(project=>project.tags))].sort((a,b)=>a.localeCompare(b));
