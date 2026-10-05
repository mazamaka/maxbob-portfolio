import { hydrateRoot } from "react-dom/client";
import { ProjectGallery } from "@/components/project-gallery";
import {LocaleProvider,type Locale} from "./i18n";
const locale=(document.documentElement.lang||"en") as Locale;
const root = document.getElementById("project-gallery");
if (root) hydrateRoot(root, <LocaleProvider locale={locale}><ProjectGallery /></LocaleProvider>);
