import { gzipSync } from 'node:zlib'
import type { Plugin } from 'vite'

/** Guard the actual client bundle graph, not just import statements in source. */
export function checkHomepageChunks(): Plugin {
  let server = false
  return {
    name: 'sjf4j-homepage-chunks',
    apply: 'build',
    configResolved(config) {
      server = Boolean(config.build.ssr)
    },
    generateBundle(_, bundle) {
      if (server) return
      const chunks = Object.values(bundle).filter(chunk => chunk.type === 'chunk')
      const app = chunks.find(chunk => chunk.isEntry && chunk.name === 'app')
      if (!app) this.error('Missing VitePress client entry')

      for (const name of ['index.md', 'zh_index.md']) {
        const page = chunks.find(chunk => chunk.isEntry && chunk.name === name)
        if (!page) this.error(`Missing homepage entry: ${name}`)
        const visited = new Set<string>()
        let bytes = 0
        const visit = (fileName: string) => {
          if (visited.has(fileName)) return
          const chunk = bundle[fileName]
          if (!chunk || chunk.type !== 'chunk') return
          visited.add(fileName)
          bytes += gzipSync(chunk.code).length
          for (const moduleId of Object.keys(chunk.modules)) {
            const id = moduleId.replaceAll('\\', '/')
            if (/\/node_modules\/(?:mermaid\/|@mermaid-js\/)/.test(id)
              || /\/\.vitepress\/theme\/(?:generator\/|components\/GeneratorPlayground\.vue)/.test(id)) {
              this.error(`${name} eagerly loads page-only module: ${id}`)
            }
          }
          // Dynamic imports deliberately belong to a separate loading path.
          chunk.imports.forEach(visit)
        }
        visit(app.fileName)
        visit(page.fileName)
        this.info(`${name}: ${(bytes / 1024).toFixed(1)} KiB gzip initial JS (app + page + static imports)`)
      }
    },
  }
}
