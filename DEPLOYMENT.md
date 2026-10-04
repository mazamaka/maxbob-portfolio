# Static deployment

Live portfolio: **https://cv.maxbob.xyz/**

1. Run `npm ci`, `npm run typecheck`, `npm run build` and `npm run check`.
2. Publish only the contents of `dist/` to a static web host.
3. Serve `index.html` for directory URLs, including `/cases/octo-mcp/`, `/cases/alpha-scout/` and `/cases/browser-fingerprinting/`.
4. Enable HTTPS. Revalidate HTML on requests; retain query-string cache versions on assets.
5. Check the home page, case studies, search, CV download and footer links after publishing.

Keep the previous build available for rollback. Hosting configuration and credentials are managed separately from this repository.

If deploying to a different domain, update canonical URLs, `dist/robots.txt`, `dist/sitemap.xml` and the case-page generator before building.
