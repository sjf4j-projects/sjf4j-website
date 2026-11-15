import { defineConfig } from 'vitepress'

const repo = 'https://github.com/sjf4j-projects/sjf4j'

export default defineConfig({
  title: 'SJF4J',
  description: 'A unified structural processing layer built on JSON semantics.',
  lang: 'en-US',
  cleanUrls: true,
  ignoreDeadLinks: false,

  themeConfig: {
    siteTitle: 'SJF4J',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/getting_started' },
      { text: 'Benchmarks', link: '/docs/benchmarks' },
      { text: 'Generator', link: '/generator' },
      { text: 'GitHub', link: repo },
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
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/docs/getting_started' },
            { text: 'Installation', link: '/docs/installation' },
            { text: 'Quickstart', link: '/docs/quickstart' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/docs/architecture' },
            { text: 'Modeling (OBNT)', link: '/docs/modeling' },
            { text: 'Backends & Formats', link: '/docs/backends' },
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
          text: 'Compiled APIs',
          items: [{ text: 'Overview & How It Works', link: '/docs/compiled' }],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Benchmarks', link: '/docs/benchmarks' },
            { text: 'Javadocs', link: 'https://javadoc.io/doc/org.sjf4j/sjf4j-core' },
            { text: 'FAQ', link: '/docs/faq' },
            { text: 'Changelog', link: '/docs/changelog' },
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
})

