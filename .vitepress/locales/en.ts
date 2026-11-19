// English is the default language; its routes stay unchanged.
export const enLocale = {
  label: 'English',
  lang: 'en-US',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/getting-started' },
      { text: 'Benchmarks', link: '/docs/benchmarks' },
      { text: 'Generator', link: '/generator' },
    ],
    sidebar: {
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/docs/getting-started' },
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
            { text: 'Value Codecs', link: '/docs/value-codecs' },
            { text: 'External Nodes', link: '/docs/external-nodes' },
            { text: 'Spring Integration', link: '/docs/spring-integration' },
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
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'SJF4J contributors',
    },
  },
}
