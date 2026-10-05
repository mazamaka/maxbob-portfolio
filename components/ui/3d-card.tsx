"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CodeXml, Star, type LucideIcon } from "lucide-react";
import {useT} from "@/src/i18n";
import {ThemeImage} from "@/components/theme-image";
import { cn } from "@/lib/utils";
import { ProjectTags } from "@/components/project-tags";

export interface InteractiveTravelCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  nightImageUrl: string;
  actionText: string;
  href: string;
  onActionClick?: () => void;
  actionHref?: string;
  description?: string;
  tags?: string[];
  onTagSelect?: (tag:string)=>void;
  stars?: number;
  icon?: LucideIcon;
  className?: string;
  id?: string;
  imagePosition?: string;
  visual?: string;
  rank?: number;
}

// Adapted from the supplied travel-card template for a readable project portfolio.
export const InteractiveTravelCard = React.forwardRef<HTMLDivElement, InteractiveTravelCardProps>(
  ({title, subtitle, imageUrl, nightImageUrl, actionText, href, onActionClick, actionHref, description, tags = [], onTagSelect, stars, icon: Icon, className, id, imagePosition = "50% 50%", visual = "ai", rank}, ref) => {
    const t=useT();
    const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, {damping: 24, stiffness: 150});
    const springY = useSpring(mouseY, {damping: 24, stiffness: 150});
    const rotateX = useTransform(springY, [-.5, .5], [5, -5]);
    const rotateY = useTransform(springX, [-.5, .5], [-5, 5]);
    const reduced = useReducedMotion();
    const [paused, setPaused] = React.useState(true);
    React.useEffect(() => {
      const sync = () => setPaused(document.documentElement.classList.contains("motion-paused"));
      sync(); window.addEventListener("portfolio-motion", sync);
      return () => window.removeEventListener("portfolio-motion", sync);
    }, []);
    React.useEffect(() => { if (paused || reduced) {mouseX.set(0); mouseY.set(0);} }, [paused, reduced, mouseX, mouseY]);
    const reset = () => { mouseX.set(0); mouseY.set(0); };
    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (paused || reduced || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouseX.set((e.clientX - rect.left) / rect.width - .5);
      mouseY.set((e.clientY - rect.top) / rect.height - .5);
    };
    const repository = href.startsWith("https://github.com/");
    const linkProps = {target: "_blank", rel: "noopener noreferrer"};
    return <article className="p-card-wrap" id={id} data-visual={visual} data-phase="work">
      <motion.div ref={ref} onPointerMove={handleMove} onPointerLeave={reset} onPointerCancel={reset}
        style={{rotateX, rotateY, transformStyle: "preserve-3d"}}
        className={cn("p-card pb:relative pb:w-full pb:rounded-2xl", className)}>
        <div className="p-art" aria-hidden="true">
          <ThemeImage nightSrc={nightImageUrl} src={imageUrl} alt="" loading="lazy" decoding="async" width="1672" height="941" style={{objectPosition: imagePosition}} />
          <div className="p-art-shade" />
          <span className="p-art-number">{rank ? String(rank).padStart(2, "0") : ""}</span>
          {Icon && <Icon className="p-art-icon" strokeWidth={1.1} />}
          <span className="p-art-caption">{t(subtitle)}</span>
        </div>
        <div className="p-card-top pb:flex pb:items-center pb:justify-between">
          <span className="p-card-label">{rank && rank <= 3 ? t("FEATURED CASE") : repository ? t("OPEN SOURCE") : t("LIVE PRODUCT")}</span>
          <a className="p-top-link" href={href} {...linkProps} aria-label={`${repository ? t("GitHub repository") : t("Visit website")}: ${title}${stars !== undefined ? t(", {count} stars",{count:stars}) : ""}`} title={stars !== undefined ? t("{count} total GitHub stars",{count:stars}) : t("Visit {name}",{name:title})}>
            {stars !== undefined && <><Star size={14} aria-hidden="true"/><span>{stars}</span></>}
            <ArrowUpRight size={16} aria-hidden="true"/>
          </a>
        </div>
        <div className="p-content">
          <h3>{title}</h3><p>{t(description??"")}</p>
          <ProjectTags tags={tags} label={t("{name} technologies",{name:title})} onSelect={onTagSelect}/>
          <div className="p-actions">
            {actionHref ? <a className="p-primary" href={actionHref} {...(actionHref.startsWith("https:") ? linkProps : {})}>{t(actionText)}</a>
              : <button type="button" className="p-primary" onClick={onActionClick}>{t(actionText)}</button>}
            {actionHref !== href && <a className="p-source" href={href} {...linkProps}>{repository && <CodeXml size={16} aria-hidden="true"/>}{repository ? "GitHub" : t("Website")}</a>}
          </div>
        </div>
      </motion.div>
    </article>;
  }
);
InteractiveTravelCard.displayName = "InteractiveTravelCard";
