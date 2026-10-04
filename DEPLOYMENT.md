# Static deployment

Live portfolio: **https://cv.maxbob.xyz/**

1. Run `npm ci`, `npm run typecheck`, `npm run build` and `npm run check`.
2. Publish only the contents of `dist/` to a static web host.
3. Serve `index.html` for directory URLs, including `/cases/octo-mcp/`, `/cases/alpha-scout/` and `/cases/browser-fingerprinting/`.
4. Enable HTTPS. Revalidate HTML on requests; retain query-string cache versions on assets.
5. Check the home page, case studies, search, CV download, footer links and live GitHub star counts after publishing.
6. Verify `/favicon.svg`, `/favicon.ico`, `/assets/social/maxbob-v1.jpg`, `/site-manifest.json`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/projects/` return the correct files without an authentication or bot challenge. Check case-specific social images too. The web manifest uses a `.json` extension so standard static hosts serve it as JSON without custom MIME configuration.

The browser reads public counts from `https://api.github.com`. If adding a Content Security Policy, allow that origin in `connect-src`. No GitHub token or scheduled rebuild is required; device-local saved counts are used when the API is unavailable.

Keep the previous build available for rollback. Hosting configuration and credentials are managed separately from this repository.

If deploying to a different domain, update `SITE` in `scripts/site_metadata.py` and the branding-card URL in `scripts/build-brand-assets.cjs`, then rebuild metadata and branding. The site build regenerates canonical URLs, robots.txt and the sitemap. Submit the sitemap through the domain owner's existing search-console accounts when available; no account identifiers or verification tokens are bundled.
