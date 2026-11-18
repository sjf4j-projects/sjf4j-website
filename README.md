# SJF4J Website

The [SJF4J](https://github.com/sjf4j-projects/sjf4j) documentation website, built with VitePress and published at [sjf4j.org](https://sjf4j.org).

## Local development

Use Node.js 22 (the version used by GitHub Actions).

```bash
npm ci
npm run docs:dev
```

Build the site and check internal links:

```bash
npm run docs:build
npm run docs:preview
```

## Project structure

- `index.md` and `.vitepress/theme/` — homepage and custom components
- `docs/` — documentation and feature guides
- `docs/benchmarks.md` — benchmark overview; detailed reports live in the [SJF4J source repository](https://github.com/sjf4j-projects/sjf4j/tree/main/docs/performance)
- `generator.md` — current Schema-to-Java Generator landing page
- `public/` — static assets, `robots.txt`, and AI discovery files
- `.vitepress/config.mts` — site navigation, metadata, and sitemap
- `scripts/sync-readme.mjs` — generates `docs/getting-started.md` from the upstream README
- `.github/workflows/` — CI, README synchronization, and GitHub Pages deployment

## Content maintenance

- Documentation is written in English. Keep Runtime and Compiled examples together where relevant.
- Keep JDBC Result Mapping separate from general Object Mapping.
- The [SJF4J README](https://github.com/sjf4j-projects/sjf4j/blob/main/README.md) is the source for `docs/getting-started.md`. The scheduled sync workflow proposes changes by pull request; fix README content and links upstream rather than patching the generated page.
- Link to upstream benchmark reports instead of maintaining a second copy.
- Keep the explicit legacy URL redirect pages for existing inbound links; new documentation should use canonical routes.

## Deployment

`.github/workflows/deploy.yml` builds and deploys the site from `main` to GitHub Pages. The custom domain and HTTPS configuration are managed in the repository's **Settings → Pages**.

All changes to `main` must be submitted through a pull request.
