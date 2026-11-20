import type MarkdownIt from 'markdown-it'
import { localizedMarkdownLink } from './routes'

/**
 * Translate links authored in localized Markdown without changing the source
 * text. VitePress's normal link renderer still validates all resulting URLs.
 */
export function installLocalizedMarkdownLinks(md: MarkdownIt): void {
  const original = md.renderer.rules.link_open
  if (!original) throw new Error('VitePress link renderer is unavailable')

  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    if (env.localeIndex === 'zh' && env.relativePath) {
      const token = tokens[index]
      const href = token.attrGet('href')
      if (href) {
        token.attrSet('href', localizedMarkdownLink(href, env.relativePath, 'zh-CN'))
      }
    }
    return original(tokens, index, options, env, self)
  }
}
