import { renderToString } from "react-dom/server";
import { ProjectGallery } from "@/components/project-gallery";
import {LocaleProvider,type Locale} from "./i18n";
export const renderGallery=(locale:Locale)=>renderToString(<LocaleProvider locale={locale}><ProjectGallery /></LocaleProvider>);
