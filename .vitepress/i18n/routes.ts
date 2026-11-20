/**
 * List only pages with a published translation, using their English URLs.
 * English is the canonical source of page identifiers and is not prefixed.
 *
 * Adding zh/docs/binding.md requires adding '/docs/binding' below. CI checks
 * the registry against the filesystem in both directions.
 */
export const translatedPages: Readonly<Record<string, readonly string[]>> = {
  'zh-CN': ['/', '/docs/getting-started', '/docs/installation', '/docs/modeling', '/docs/compiled', '/docs/binding', '/docs/navigating']
}

export const localePrefixes: Readonly<Record<string, string>> = {
  'en-US': '',
  'zh-CN': '/zh'
}

const published = new Map(
  Object.entries(translatedPages).map(([locale, pages]) => [locale, new Set(pages)])
)

function splitUrl(url: string) {
  const index = url.search(/[?#]/)
  return index < 0
    ? { path: url, suffix: '' }
    : { path: url.slice(0, index), suffix: url.slice(index) }
}

function normalizePath(path: string): string {
  const clean = path.replace(/\.(md|html)$/, '').replace(/\/index$/, '/')
  return clean === '' ? '/' : clean
}

/** Return the English pathname corresponding to a localized page. */
export function englishPath(pathname: string): string {
  for (const [locale, prefix] of Object.entries(localePrefixes)) {
    if (locale === 'en-US' || !prefix) continue
    if (pathname === prefix || pathname === prefix + '/') return '/'
    if (pathname.startsWith(prefix + '/')) {
      return normalizePath(pathname.slice(prefix.length))
    }
  }
  return normalizePath(pathname)
}

export function hasTranslation(englishPage: string, language: string): boolean {
  return published.get(language)?.has(englishPath(englishPage)) ?? false
}

/** List language alternates only when the corresponding Markdown exists. */
export function alternatePages(pathname: string): Record<string, string> {
  const original = englishPath(pathname)
  const alternates: Record<string, string> = { 'en-US': original }
  for (const [locale, prefix] of Object.entries(localePrefixes)) {
    if (locale !== 'en-US' && hasTranslation(original, locale)) {
      alternates[locale] = prefix + original
    }
  }
  return alternates
}

/**
 * Resolve a normal link in the current page language, falling back to English
 * for untranslated pages. Non-site URLs and anchors are left unchanged.
 */
export function localizedLink(href: string, language: string): string {
  const prefix = localePrefixes[language]
  if (!prefix || !href.startsWith('/') || href.startsWith('//') ||
      href === prefix || href.startsWith(prefix + '/')) {
    return href
  }

  const { path, suffix } = splitUrl(href)
  const original = englishPath(path)
  return hasTranslation(original, language)
    ? prefix + original + suffix
    : href
}

/**
 * Used by the language menu: show the equivalent page when translated,
 * otherwise send the visitor to the requested language homepage.
 * Keep the original fragment/query only for a corresponding page.
 */
export function switchLanguage(href: string, targetLanguage: string): string {
  const prefix = localePrefixes[targetLanguage]
  if (prefix === undefined || !href.startsWith('/') || href.startsWith('//')) {
    return href
  }
  const { path, suffix } = splitUrl(href)
  const original = englishPath(path)
  if (targetLanguage === 'en-US') return original + suffix
  return hasTranslation(original, targetLanguage)
    ? prefix + original + suffix
    : prefix + '/'
}

/**
 * Rewrite a Markdown internal link in a localized page. Relative links are
 * resolved against the corresponding English source location before applying
 * the translation registry. Assets and external URLs are not changed.
 */
export function localizedMarkdownLink(
  href: string,
  sourceRelativePath: string,
  language: string
): string {
  if (!localePrefixes[language] || !href ||
      href.startsWith('#') || href.startsWith('?') ||
      href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return href
  }

  const { path } = splitUrl(href)
  // Do not touch assets such as images, downloads, or JavaScript files.
  if (/\.[a-z\d]+$/i.test(path) && !/\.(md|html)$/i.test(path)) return href

  if (href.startsWith('/')) return localizedLink(href, language)

  const sourcePage = englishPath('/' + sourceRelativePath.replace(/\.md$/, '').replace(/\/index$/, '/'))
  const base = new URL(sourcePage, 'https://sjf4j.org')
  const resolved = new URL(href, base)
  return localizedLink(resolved.pathname + resolved.search + resolved.hash, language)
}
