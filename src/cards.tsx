import { hydrateRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ProjectGallery } from "@/components/project-gallery";
import {LocaleProvider,type Locale} from "./i18n";
const locale=(document.documentElement.lang||"en") as Locale;
const root = document.getElementById("project-gallery");
if (root) {
 const gallery=hydrateRoot(root, <LocaleProvider locale={locale}><ProjectGallery /></LocaleProvider>);
 window.addEventListener('portfolio-language',()=>{
  const next=document.documentElement.lang as Locale;
  flushSync(()=>gallery.render(<LocaleProvider locale={next}><ProjectGallery /></LocaleProvider>));
 });
}
