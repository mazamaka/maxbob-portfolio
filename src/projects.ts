import { Bot, Radar, Fingerprint, Network, Activity, Workflow, ScanEye, Smartphone, Server, ChartNoAxesCombined, ShieldCheck, AudioLines } from "lucide-react";
import snapshot from "./repositories.json";

const items = [
  {repo:"octo-mcp", title:"octo-mcp", category:"AI agents / MCP", icon:Bot, visual:"ai", id:"project-octo", description:"Give AI agents control of browser profiles and page actions through one MCP server.", tags:["Python","MCP","Playwright","CDP"], caseHref:"cases/octo-mcp/"},
  {repo:"alpha-scout", title:"alpha-scout", category:"Research / Automation", icon:Radar, visual:"automation", id:"project-scout", description:"Collect sources, evaluate ideas with an LLM and deliver useful signals to Telegram.", tags:["asyncio","LLM","FastAPI","Telegram"], caseHref:"cases/alpha-scout/"},
  {repo:"nodriver-antidetect", title:"nodriver-antidetect", category:"Browser / Fingerprinting", icon:Fingerprint, visual:"antifraud", id:"project-fingerprint", description:"Configure browser fingerprints through CDP and run isolated browser environments in Docker.", tags:["Python","nodriver","CDP","Docker"], caseHref:"cases/browser-fingerprinting/"},
  {repo:"claudegate", title:"Claudegate", category:"AI infrastructure", icon:Network, visual:"ai", description:"An OpenAI-compatible gateway to Claude Code, with streaming, tools and persistent conversations.", tags:["Python","FastAPI","Streaming"]},
  {repo:"llm-latency-tracker", title:"LLM Latency", category:"Observability / Open data", icon:Activity, visual:"ai", description:"Measure regional LLM API latency and uptime. Explore open datasets through JSON and MCP.", tags:["Python","Monitoring","MCP"], live:"https://llmlatency.dev"},
  {repo:"browser-automation-system", title:"Browser Automation", category:"AI / Browser workflows", icon:Workflow, visual:"automation", description:"Run AI-driven browser tasks with execution history, checkpoints and reusable patterns.", tags:["browser-use","FastAPI","React"]},
  {repo:"ipqs-checker", title:"IPQS Checker", category:"Antifraud diagnostics", icon:ScanEye, visual:"antifraud", description:"Inspect IP reputation and device fingerprints with a backend and browser extensions.", tags:["FastAPI","Chrome","Firefox"]},
  {repo:"bluestacks-antidetect", title:"BlueStacks Antidetect", category:"Android automation", icon:Smartphone, visual:"antifraud", description:"Manage emulator instances, device profiles and network settings through FastAPI and ADB.", tags:["Python","ADB","FastAPI"]},
  {repo:"claude-code-server-ops", title:"Claude Code Ops", category:"Deployment / Operations", icon:Server, visual:"ai", description:"Deploy Claude Code API services with systemd, completion probes and end-to-end smoke checks.", tags:["Python","Linux","systemd"]},
  {repo:"polymarket-bot", title:"Polymarket Bot", category:"Applied AI / Market research", icon:ChartNoAxesCombined, visual:"automation", description:"Explore prediction-market signals with LLM analysis, weather data and breaking news.", tags:["Python","Claude","asyncio"]},
  {repo:"antifraud-spy", title:"Antifraud Spy", category:"Browser instrumentation", icon:ShieldCheck, visual:"antifraud", description:"A browser extension for observing fingerprinting techniques and antifraud checks.", tags:["JavaScript","Chrome","Diagnostics"]},
  {repo:null, title:"MaxBob AI", category:"Voice / Native applications", icon:AudioLines, visual:"ai", description:"A native voice assistant connecting iOS and macOS to realtime AI and a Python backend.", tags:["SwiftUI","WebRTC","Python"], live:"https://maxbob.xyz"}
];
export const projects = items.map((project, index) => {
  const repo = snapshot.repositories.find(item => item.name === project.repo);
  if (project.repo && !repo) throw new Error(`Missing public repository: ${project.repo}`);
  return {...project, rank:index + 1, href:repo?.html_url ?? project.live!, stars:repo?.stargazers_count,
    imageUrl:`assets/projects/${project.repo ?? "maxbob-ai"}-v1.webp`, imagePosition:"50% 50%"};
});
export const starsUpdatedAt = snapshot.updatedAt;
