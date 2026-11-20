import { createSidebar } from './navigation'

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
    sidebar: { '/docs/': createSidebar('en-US') },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'SJF4J contributors',
    },
  },
}
