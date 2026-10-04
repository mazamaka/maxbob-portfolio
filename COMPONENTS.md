# Project cards

The supplied React tilt-card template lives in `components/ui/3d-card.tsx`.
It is adapted to project content, with real navigation, Lucide icons, GitHub stars,
responsive sizes, reduced-motion handling and the existing pause control.
The generated AI systems artwork is reused to match the site's visual style.

The surrounding site remains static. Only the card gallery hydrates with React.
Its complete markup is rendered at build time, so copy and links work without JavaScript.

- Components: `components/ui`, with the `@/components/ui` alias.
- Gallery/content: `components/project-gallery.tsx`, `src/projects.ts`.
- Public GitHub snapshot: `src/repositories.json`. Stars are total GitHub counts.
- Styles: `styles/projects.css`; Tailwind v4 utilities use the `pb:` prefix.
- Shared class helper: `lib/utils.ts`.
- `components.json` supplies shadcn-compatible paths and CSS configuration.

No new shadcn scaffold is needed. After cloning, run `npm ci`, `npm run typecheck`
and `npm run build`. This preserves the existing header, routes and styles.
If adding a shadcn component later, use `npx shadcn@latest add <component>` from
this root. The `components/ui` folder keeps reusable UI separate from page content
and allows the template's imports to resolve consistently.

References: https://ui.shadcn.com/docs/installation/manual,
https://tailwindcss.com/docs/theme, https://motion.dev/docs/react-use-reduced-motion.

Search: `src/catalog.json` contains public metadata and previously approved, anonymized private summaries. No private repository URLs or source code is included. `src/search.ts` handles bilingual aliases, AND queries, technology and discipline filters. The search runs locally and does not call an LLM or GitHub per keystroke. The page is now light-only.

`npm run check` also checks bilingual search, combined filters, unique catalog entries and the absence of private GitHub links. The site now uses only the light appearance.
