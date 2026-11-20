# Internationalization

English is the primary language at `/`; Simplified Chinese is under `/zh/`.
VitePress handles locale content/configuration; shared Vue components read typed
messages from `theme/i18n/`. Do not duplicate Vue components or Java examples.

## Sources of truth

| Concern | Location |
| --- | --- |
| VitePress menu, sidebar, footer | `locales/en.ts`, `locales/zh.ts` |
| Shared UI translations | `theme/i18n/{types,en,zh,index}.ts` |
| Shared code examples / benchmarks | `theme/data/` |
| Shared homepage | `theme/components/HomePage.vue` |
| Published translation paths | `i18n/routes.ts` |
| Language switcher | `theme/components/LocaleSwitcher.vue` |
| Localized Markdown links | `i18n/markdown.ts` |
| Per-page SEO / locale metadata | `config.mts` |

## Add a new English documentation page

1. Create `docs/<slug>.md` and add it to the English sidebar in `locales/en.ts`.
2. Follow the usual documentation conventions. Keep the English URL unchanged.
3. The Chinese site continues to link to English for pages without translations.
4. Run `npm run docs:build` and the existing tests; submit a PR.

No other internationalization change is required for an English-only page.

## Translate an existing page

1. Create `zh/docs/<slug>.md` with translated prose, keeping technical names
   and examples consistent with the English original.
2. Add the **English URL** (`/docs/<slug>`) to `translatedPages['zh-CN']`
   in `i18n/routes.ts`.
3. Add the page to the Chinese sidebar in `locales/zh.ts` when appropriate.
   Reuse `localizedLink('/docs/<slug>', 'zh-CN')` so un-translated targets
   continue to point to English.
4. In Chinese Markdown, use normal internal links such as
   `[Installation](/docs/installation)` or `[Installation](./installation.md)`.
   The Markdown renderer resolves these to the Chinese counterpart **if it
   exists in the registry**, otherwise to English. Raw HTML links and custom
   Vue components must call `localizedLink()` explicitly.
5. Run `npm run test:i18n`, `npm run test:generator`, and `npm run docs:build`.

CI requires the registry and translated Markdown paths to match **in both
directions**, and checks that the corresponding English file exists. An
unregistered translation or a registered-but-missing page fails the build.

Language switching preserves the corresponding page and URL fragment when a
translation exists. When missing, it navigates to the **target language's
homepage**; ordinary content links instead fall back to the English page.

SEO `canonical`, `hreflang` and `x-default` links are generated from the
same registry. Do not add per-page SEO links manually.

### Translation synchronization

When changing an English page that already has a Chinese counterpart, review
whether its translation needs updating. Ideally update both in the same PR;
otherwise explicitly note the deferred translation in the PR. Do not silently
leave outdated translated API documentation.

## Shared components

Put locale text in `theme/i18n/en.ts` and `theme/i18n/zh.ts`, satisfying the
`SiteMessages` type. Store data, Java samples and benchmark metrics in
`theme/data/`. Avoid per-language `v-if` and ternaries in shared components.

VitePress 1.6.4 only supports boolean `i18nRouting`. The theme therefore uses
a small page-aware switcher via supported layout slots. Its native translation
controls are hidden; do not enable default per-page routing alongside it.

## Add another language

1. Add the locale entry in `locales/<locale>.ts` and register it in
   `config.mts`.
2. Add the typed message dictionary in `theme/i18n/` and register it in the
   locale resolver.
3. Add the language prefix, published paths, and Markdown handling in
   `i18n/routes.ts` and `i18n/markdown.ts`, then add the matching pages.
4. Extend routing, locale coverage and SEO tests before publishing.

All changes to `main` must be merged through a PR.
