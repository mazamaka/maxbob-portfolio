import { renderToString } from "react-dom/server";
import { ProjectGallery } from "@/components/project-gallery";
export const html = renderToString(<ProjectGallery />);
