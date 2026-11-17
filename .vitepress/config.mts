import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const repo = 'https://github.com/sjf4j-projects/sjf4j'

export default withMermaid(defineConfig({
  title: 'SJF4J',
  description: 'A unified structural processing layer built on JSON semantics.',
  lang: 'en-US',
  cleanUrls: true,
  ignoreDeadLinks: false,

  themeConfig: {
    siteTitle: 'S<span class="logo-java-j">J</span>F4J',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/getting_started' },
      { text: 'Benchmarks', link: '/docs/benchmarks' },
      { text: 'Generator', link: '/generator' },
    ],
    sidebar: {
      '/docs/performance/': [
        {
          text: 'Benchmarks',
          items: [
            { text: 'Overview', link: '/docs/benchmarks' },
            { text: 'JSON Binding', link: '/docs/performance/binding' },
            { text: 'Native Image Binding', link: '/docs/performance/binding-native' },
            { text: 'JSONPath Navigation', link: '/docs/performance/path' },
            { text: 'JSON Schema Validation', link: '/docs/performance/schema' },
            { text: 'Object Mapping', link: '/docs/performance/mapping' },
            { text: 'JDBC Result Mapping', link: '/docs/performance/jdbc-mapping' },
          ],
        },
      ],
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/docs/getting_started' },
            { text: 'Installation', link: '/docs/installation' },
            { text: 'Modeling (OBNT)', link: '/docs/modeling' },
            { text: 'Compiled APIs', link: '/docs/compiled' },
            { text: 'Benchmarks', link: '/docs/benchmarks' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Binding', link: '/docs/binding' },
            { text: 'Navigating', link: '/docs/navigating' },
            { text: 'Validating', link: '/docs/validating' },
            { text: 'Object Mapping', link: '/docs/mapping' },
            { text: 'JDBC Result Mapping', link: '/docs/jdbc-mapping' },
            { text: 'Patching', link: '/docs/patching' },
          ],
        },
        {
          text: 'Integrations',
          items: [
            { text: 'Backends & Formats', link: '/docs/backends' },
            { text: 'External Nodes', link: '/docs/external-nodes' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'FAQ', link: '/docs/faq' },
            { text: 'Javadocs', link: 'https://javadoc.io/doc/org.sjf4j/sjf4j-core' },
            { text: 'Changelog', link: 'https://github.com/sjf4j-projects/sjf4j/blob/main/CHANGELOG.md' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: repo }],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'SJF4J contributors',
    },
  },
}))
