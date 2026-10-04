# 🎨 MaxBob — AI & Automation Portfolio

An illustrated portfolio of **AI agents, browser automation, fingerprinting tools and production systems** by Maksym Babenko.

🌐 **[Live portfolio](https://cv.maxbob.xyz/)** · 🐙 **[GitHub profile](https://github.com/mazamaka)** · 📄 **[Resume — EN / RU](https://github.com/mazamaka/resume)**

![MaxBob illustrated developer workshop](dist/assets/developer-workshop-v1.webp)

## ✨ What’s inside

- **Project catalog** — selected work, GitHub links, stack tags and case studies.
- **Instant search** — English and Russian queries across curated project content, with suggestions, match highlights and filters.
- **Private project overviews** — reviewed capability summaries alongside public work.
- **Illustrated interface** — project artwork, responsive layouts, keyboard navigation and reduced-motion support.
- **Static delivery** — no backend or API keys needed to serve the site. Search runs in the browser; GitHub stars are a dated snapshot.

## 🛠️ Stack

**React · TypeScript · Tailwind CSS · Motion · GSAP · Lucide**

Built with **esbuild**, with Python scripts for case-study pages and link checks.

## 🚀 Run locally

Install Node.js with npm and Python 3, then:

```sh
npm ci
npm run typecheck
npm run build
npm run check
python3 -m http.server 8000 --directory dist
```

Open [localhost:8000](http://localhost:8000). The checked-in `dist/` can also be served directly.

## 🧭 Update the portfolio

| Content | Source |
| --- | --- |
| Main page, navigation and footer | `dist/index.html` |
| Project descriptions and search content | `src/catalog.json` |
| Featured project selection | `src/projects.ts` |
| Public repository snapshot | `src/repositories.json` |
| Search and gallery components | `src/search.ts`, `components/` |
| Layout and styling | `dist/light-theme.css`, `styles/projects.css` |
| Case-study pages | `scripts/build-cases.py` |
| Illustrations, font and downloadable CV | `dist/assets/` |

The build replaces the gallery between the `PROJECT-GALLERY` markers and regenerates case-study pages. Keep the main page shell in `dist/index.html`; it is a build input as well as deployable output.

To regenerate the CV, install the optional Python `reportlab` package and run `python3 scripts/build-cv.py`. The ready-to-download PDF is included.

Publish the contents of **`dist/`** to a static web host. See [deployment notes](DEPLOYMENT.md) and [component notes](COMPONENTS.md).

## 🔎 About the project data

Search uses curated summaries of project capabilities. Private project entries contain descriptions only; their source repositories remain private. The catalog does not fetch private repositories or use credentials at runtime.

Third-party font and library notices are retained in `dist/assets/fonts/` and `dist/vendor/`.
