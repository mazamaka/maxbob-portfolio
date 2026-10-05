import type {ReactNode} from "react";

interface ProjectTagsProps {
  tags:string[];
  label?:string;
  onSelect?:(tag:string)=>void;
  renderTag?:(tag:string)=>ReactNode;
}

export function ProjectTags({tags,label,onSelect,renderTag}:ProjectTagsProps){
  return <ul className="p-tags" aria-label={label}>{tags.map(tag=><li key={tag}>
    <a href={`?q=${encodeURIComponent(tag)}#work`} aria-label={`Find projects using ${tag}`} title={`Find projects using ${tag}`}
      onClick={event=>{
        // Keep open-in-new-tab, copy-link and the pre-hydration fallback native.
        if(!onSelect||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();onSelect(tag);
      }}>{renderTag?renderTag(tag):tag}</a>
  </li>)}</ul>;
}
