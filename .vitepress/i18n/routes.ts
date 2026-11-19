// Central registry of pages that actually have translated equivalents.
// Keep documentation and generator links on English until each page is published.
const published: Record<string, ReadonlySet<string>> = {
  'zh-CN': new Set(['/'])
}

const prefixes: Record<string, string> = { 'zh-CN': '/zh' }

/**
 * Resolve a link to the current locale only when that translated page exists.
 * External URLs, anchors and currently untranslated paths are left unchanged.
 */
export function localizedLink(href: string, language: string): string {
  const prefix = prefixes[language]
  if (!prefix || !href.startsWith('/') || href.startsWith('//') || href.startsWith(prefix + '/')) {
    return href
  }

  const suffixStart = href.search(/[?#]/)
  const pathname = suffixStart < 0 ? href : href.slice(0, suffixStart)
  const suffix = suffixStart < 0 ? '' : href.slice(suffixStart)
  if (!published[language]?.has(pathname)) return href

  return prefix + pathname + suffix
}
