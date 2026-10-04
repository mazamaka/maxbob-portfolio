import { hydrateRoot } from "react-dom/client";
import { ProjectGallery } from "@/components/project-gallery";
const root = document.getElementById("project-gallery");
if (root) hydrateRoot(root, <ProjectGallery />);
