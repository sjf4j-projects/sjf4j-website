# Internationalization

English is the primary language at `/`; Simplified Chinese is under `/zh/`.
VitePress handles locale content/configuration; shared Vue components read typed
messages from `theme/i18n/`. Do not duplicate Vue components or Java examples.

## Sources of truth

| Concern | Location |
| --- | --- |
| VitePress nav labels and footer | `locales/en.ts`, `locales/zh.ts` |
| Shared documentation sidebar inventory | `locales/navigation.ts` |
| Shared UI translations | `theme/i18n/{types,en,zh,index}.ts` |
| Shared code examples / benchmarks | `theme/data/` |
| Shared homepage | `theme/components/HomePage.vue` |
| Published translation paths | `i18n/routes.ts` |
| Language switcher | `theme/components/LocaleSwitcher.vue` |
| Localized Markdown links | `i18n/markdown.ts` |
| Per-page SEO / locale metadata | `config.mts` |

## Add a new English documentation page

1. Create `docs/<slug>.md` and add its English URL and both navigation labels
   to the shared tree in `locales/navigation.ts`.
2. Follow the usual documentation conventions. Keep the English URL unchanged.
3. The Chinese site continues to link to English for pages without translations.
4. Run `npm run docs:build` and the existing tests; submit a PR.

No other internationalization change is required for an English-only page.

## Translate an existing page

1. Create `zh/docs/<slug>.md` with translated prose, keeping technical names
   and examples consistent with the English original.
2. Add the **English URL** (`/docs/<slug>`) to `translatedPages['zh-CN']`
   in `i18n/routes.ts`.
3. The Chinese sidebar automatically links to the newly translated page
   using `localizedLink()`; no duplicate sidebar configuration is needed.
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

### Chinese technical terminology

Keep defined SJF4J concepts and API family names in English throughout Chinese
pages, navigation labels and homepage feature panels. Translate explanations
and ordinary verbs, not the underlying technical identifiers.

| Concept | Use in Chinese docs | Avoid |
| --- | --- | --- |
| OBNT categories | **Object Node**, **Array Node**, **Value Node** | 对象节点、数组节点、值节点 |
| API families | **Runtime API**, **Compiled API**; page title **Compiled APIs** | 运行时 API、编译式 API |
| Capability-specific names | **Runtime Binding**, **Compiled Binding**, **Runtime Navigation**, **Compiled Navigation**, **Runtime Validation**, **Compiled Validation**, **Runtime Mapping**, **Compiled Mapping** | Mixed labels such as 编译式导航 or 编译式校验 |
| Domain-specific extensions | **ValueCodec**, **Value Codecs**, **ExternalNode**, **External Nodes** | 值编解码器、外部节点 when naming the API |
| Standards and model types | **JSONPath**, **JSON Pointer**, **JSON Patch**, **JSON Schema**, **OBNT**, **POJO**, **JOJO**, **JAJO** | Translated or renamed standard identifiers |

Generic Chinese words like “节点”, “后端”, “校验”, “映射”, and
“编译期生成” are still appropriate in explanatory prose. Keep API names,
annotations, code samples, data values, Markdown paths, and English fragment
IDs unchanged. Only update `translationSourceSha` after reviewing a change
to the **English source**, not for Chinese-only wording edits.

### Translation synchronization

`docs/getting-started.md` is **generated from sjf4j/README.md** by
`.github/workflows/sync-readme.yml`. Its automated PR changes **English only**.
Never generate Chinese from the upstream README or overwrite the manual
`zh/docs/getting-started.md` translation.

For the Chinese guide, `translationSourceSha` in its frontmatter records the
Git blob SHA of the English Markdown used for the last reviewed translation.
After reviewing any English changes and updating the Chinese text, refresh it:

```sh
git hash-object docs/getting-started.md
```

Use that SHA as the new `translationSourceSha`. The CI command
`npm run i18n:status` emits a **non-blocking GitHub warning** if a translated
document has no source revision or the English source has changed. This does
not prevent README sync PRs from merging; it prompts a separate Chinese update
PR when needed. Do **not** automatically change the hash without reviewing the
Chinese translation.

The same metadata convention can be used for future translated docs. When an
English page already has a Chinese counterpart, preferably update both in one
PR, or explicitly note the deferred translation in the PR.

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
