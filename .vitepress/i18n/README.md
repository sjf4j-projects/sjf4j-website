# Website internationalization

English is the default at `/`. Simplified Chinese is at `/zh/`.
The site uses VitePress native locales; no runtime machine translation.

## Sources of truth

- `locales/en.ts`, `locales/zh.ts`: VitePress navigation, footer and UI labels.
- `theme/i18n/en.ts`, `theme/i18n/zh.ts`: translatable strings for shared components.
- `theme/i18n/types.ts`: typed message contract; provide all fields in each locale.
- `theme/data/`: language-independent Java examples and benchmark values.
- `theme/components/`: shared presentation and interactions, with no per-language branches.
- `i18n/routes.ts`: published localized page paths and fallback to English.
- `index.md`, `zh/index.md`: only SEO/frontmatter; both render the same HomePage component.

## Translate the next documentation page

1. Add `zh/docs/<slug>.md` with translated prose, preserving API names and code.
2. Register the **English** route (for example, `/docs/binding`) in `i18n/routes.ts` for `zh-CN`. This activates Chinese navigation only once the page exists.
3. Use `localizedLink(path, lang)` for internal links inside shared Vue components. Untranslated pages continue to lead to English.
4. Add localized nav/sidebar entries to `locales/zh.ts` when needed. Keep canonical English URLs untouched.
5. Run `npm run test:i18n`, `npm run test:generator`, `npm run docs:build`.

Do not add inline `lang === 'zh-CN'` ternaries or duplicate shared Vue components.
Translation files may contain different prose but must match the typed message structure.

Language switching currently uses `i18nRouting: false`, intentionally returning to locale homepages until page coverage makes per-page switching safe. Revisit this only when adding translated documentation routes.

## Add another language

1. Create the locale site entry (`locales/<locale>.ts`) and register it in `config.mts`.
2. Add a message dictionary satisfying `SiteMessages` in `theme/i18n/` and register its `lang` in `theme/i18n/index.ts`.
3. Create the localized homepage Markdown entry and register its published routes/prefix in `i18n/routes.ts`.
4. Confirm language switching, metadata, sidebar, and links with build/tests before publishing.

Prefer a new translated Markdown page over embedding language branches in a shared documentation page.
