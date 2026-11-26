import type MarkdownIt from 'markdown-it'

/** Keep Mermaid fences in Markdown without pulling the renderer into the theme. */
export function installMermaidFences(md: MarkdownIt): void {
  const fence = md.renderer.rules.fence
  if (!fence) throw new Error('VitePress fence renderer is unavailable')

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const language = token.info.trim()
    if (language === 'mermaid') {
      // URI encoding protects the Vue template from quotes, braces and HTML.
      return `<MermaidDiagram graph="${encodeURIComponent(token.content)}" />\n`
    }
    // Retain the existing escape hatch for a highlighted Mermaid code sample.
    if (language === 'mmd') token.info = 'mermaid'
    return fence(tokens, index, options, env, self)
  }
}
