# SJF4J Website

Next-generation website and documentation for [SJF4J](https://github.com/sjf4j-projects/sjf4j).

This repository is a new VitePress project. It does not import the previous website implementation. The first iteration establishes content architecture and navigation before visual redesign.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run docs:dev
```

Production build (also checks internal links):

```bash
npm run docs:build
npm run docs:preview
```

## Site structure

- `index.md` — homepage
- `generator.md` — reserved page for a future Schema-to-Java Generator
- `docs/getting-started.md`, `installation.md`, `quickstart.md` — onboarding
- `docs/architecture.md`, `modeling.md`, `backends.md` — core concepts
- `docs/binding.md`, `navigating.md`, `validating.md`, `mapping.md`, `jdbc-mapping.md`, `patching.md` — features
- `docs/compiled.md` — cross-cutting compiled API mechanism
- `docs/benchmarks.md` and `docs/performance/` — benchmarks
- `docs/faq.md`, `docs/changelog.md` — reference
- `.vitepress/config.mts` — navigation and site configuration

## Content conventions

- Write documentation in English.
- Keep Runtime and Compiled examples together on each relevant feature page.
- Keep JDBC Result Mapping separate from general Object Mapping.
- Avoid duplicating detailed benchmark results: link to `sjf4j/docs/performance` as the canonical source.
- Verify Java examples against the current SJF4J release before marking feature guides complete.
- Preserve existing public documentation routes when deploying this site at `sjf4j.org`.
- Do not configure production deployment or switch the domain until the new website is approved.

## Contribution workflow

All updates to `main` must go through a pull request. GitHub Actions checks the VitePress build for proposed changes.

