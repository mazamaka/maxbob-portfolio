import { Bot, Radar, Fingerprint, Network, Activity, Workflow, ScanEye, Smartphone, Server, ChartNoAxesCombined, ShieldCheck, AudioLines, Castle, Pickaxe } from "lucide-react";
import snapshot from "./repositories.json";
import caseStudies from "./case-studies.json";

const items = [
  {repo:"octo-mcp", title:"octo-mcp", category:"AI agents / MCP", icon:Bot, visual:"ai", id:"project-octo", description:"Give AI agents control of browser profiles and page actions through one MCP server.", tags:["Python","MCP","Playwright","CDP"]},
  {repo:"alpha-scout", title:"alpha-scout", category:"Research / Automation", icon:Radar, visual:"automation", id:"project-scout", description:"Collect sources, evaluate ideas with an LLM and deliver useful signals to Telegram.", tags:["asyncio","LLM","FastAPI","Telegram"]},
  {repo:"nodriver-antidetect", title:"nodriver-antidetect", category:"Browser / Fingerprinting", icon:Fingerprint, visual:"antifraud", id:"project-fingerprint", description:"Configure browser fingerprints through CDP and run isolated browser environments in Docker.", tags:["Python","nodriver","CDP","Docker"]},
  {repo:"claudegate", title:"Claudegate", category:"AI infrastructure", icon:Network, visual:"ai", description:"An OpenAI-compatible gateway to Claude Code, with streaming, tools and persistent conversations.", tags:["Python","FastAPI","Streaming"]},
  {repo:"llm-latency-tracker", title:"LLM Latency", category:"Observability / Open data", icon:Activity, visual:"ai", description:"Measure regional LLM API latency and uptime. Explore open datasets through JSON and MCP.", tags:["Python","Monitoring","MCP"], live:"https://llmlatency.dev"},
  {repo:"browser-automation-system", title:"Browser Automation", category:"AI / Browser workflows", icon:Workflow, visual:"automation", description:"Run AI-driven browser tasks with execution history, checkpoints and reusable patterns.", tags:["browser-use","FastAPI","React"]},
  {repo:"ipqs-checker", title:"IPQS Checker", category:"Antifraud diagnostics", icon:ScanEye, visual:"antifraud", description:"Inspect IP reputation and device fingerprints with a backend and browser extensions.", tags:["FastAPI","Chrome","Firefox"]},
  {repo:"bluestacks-antidetect", title:"BlueStacks Antidetect", category:"Android automation", icon:Smartphone, visual:"antifraud", description:"Manage emulator instances, device profiles and network settings through FastAPI and ADB.", tags:["Python","ADB","FastAPI"]},
  {repo:"claude-code-server-ops", title:"Claude Code Ops", category:"Deployment / Operations", icon:Server, visual:"ai", description:"Deploy Claude Code API services with systemd, completion probes and end-to-end smoke checks.", tags:["Python","Linux","systemd"]},
  {repo:"polymarket-bot", title:"Polymarket Bot", category:"Applied AI / Market research", icon:ChartNoAxesCombined, visual:"automation", description:"Explore prediction-market signals with LLM analysis, weather data and breaking news.", tags:["Python","Claude","asyncio"]},
  {repo:"antifraud-spy", title:"Antifraud Spy", category:"Browser instrumentation", icon:ShieldCheck, visual:"antifraud", description:"A browser extension for observing fingerprinting techniques and antifraud checks.", tags:["JavaScript","Chrome","Diagnostics"]},
  {repo:null, title:"MaxBob AI", category:"Voice / Native applications", icon:AudioLines, visual:"ai", description:"A native voice assistant connecting iOS and macOS to realtime AI and a Python backend.", tags:["SwiftUI","WebRTC","Python"], live:"https://maxbob.xyz"},
  // A Minecraft server with an AI companion: the public repository is a showcase README, the source is private.
  {repo:"maxbob-minecraft-companion", title:"MaxBob Legacy", category:"Game AI / Minecraft", icon:Pickaxe, visual:"game", id:"project-maxbob", description:"A Minecraft server where every player gets a personal AI companion bot: a Forge mod body and an LLM planner brain.", tags:["Minecraft Forge","Java","Python","LLM"], live:"https://mc.maxbob.xyz", liveLabel:"Website", label:"AI COMPANION"},
  // A game, not open source: the public repository holds its website and releases. The wide card fills the rest of the last row.
  {repo:"ember-foundry-game", title:"Ember Foundry", category:"Game development / Godot", icon:Castle, visual:"game", id:"project-ember", description:"A factory-building tower defense in Godot 4, with code-built 3D art, procedural maps and Windows/macOS installers.", tags:["Godot 4","GDScript","Blender Python"], live:"https://mazamaka.github.io/ember-foundry-game/", liveLabel:"Game website", label:"FREE GAME", wide:true}
];
export const projects = items.map((project, index) => {
  const repo = snapshot.repositories.find(item => item.name === project.repo);
  if (project.repo && !repo) throw new Error(`Missing public repository: ${project.repo}`);
  const caseStudy = caseStudies.cases.find(item => item.projectId === (project.repo ?? "maxbob-ai"));
  if (!caseStudy) throw new Error(`Missing project case study: ${project.title}`);
  return {...project, caseHref:`cases/${caseStudy.slug}/`, rank:index + 1, href:repo?.html_url ?? project.live!, stars:repo?.stargazers_count,
    imageUrl:`/assets/projects/${project.repo ?? "maxbob-ai"}-v1.webp`, imagePosition:"50% 50%", nightImageUrl:`/assets/projects/${project.repo ?? "maxbob-ai"}-night-v1.webp`};
});
export const starsUpdatedAt = snapshot.updatedAt;
