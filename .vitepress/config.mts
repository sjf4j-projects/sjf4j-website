import { defineConfig } from 'vitepress'
import { installMermaidFences } from './mermaid/markdown'
import { checkHomepageChunks } from './performance/homepage-chunks'
import { enLocale } from './locales/en'
import { zhLocale, zhSearchTranslations } from './locales/zh'
import { alternatePages } from './i18n/routes'
import { installLocalizedMarkdownLinks } from './i18n/markdown'

const repo = 'https://github.com/sjf4j-projects/sjf4j'
const SITE_URL = 'https://sjf4j.org'
const SOCIAL_IMAGE = SITE_URL + '/brand/sjf4j-square-512x512.png'
const DEFAULT_DESCRIPTION = 'A unified structural processing layer built on JSON semantics.'
function pagePath(relativePath: string): string {
  if (relativePath === 'index.md') return '/'
  if (relativePath.endsWith('/index.md')) return '/' + relativePath.slice(0, -'index.md'.length)
  return '/' + relativePath.replace(/\.md$/, '')
}

export default defineConfig({
  title: 'SJF4J',
  description: DEFAULT_DESCRIPTION,
  lang: 'en-US',
  // Keep the existing English URLs; translate pages incrementally under /zh/.
  locales: { root: enLocale, zh: zhLocale },
  cleanUrls: true,
  ignoreDeadLinks: false,

  sitemap: {
    hostname: SITE_URL,
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/brand/sjf4j-square-64x64.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/sjf4j-square-180x180.png' }],
    ['meta', { name: 'theme-color', content: '#E76F51' }],
    ['meta', { name: 'application-name', content: 'SJF4J' }],
    ['meta', { property: 'og:site_name', content: 'SJF4J' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-KBSJRCWQ4V' }],
    ['script', {}, "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-KBSJRCWQ4V');"],
  ],

  transformHead({ pageData, title, description }) {
    const path = pagePath(pageData.relativePath)
    const canonical = new URL(path, SITE_URL).toString()
    const summary = description || DEFAULT_DESCRIPTION
    const isHomepage = path === '/' || path === '/zh/'
    const language = path.startsWith('/zh/') ? 'zh-CN' : 'en-US'
    const counterparts = alternatePages(path)
    const alternateLinks: Array<['link', Record<string, string>]> =
      Object.keys(counterparts).length > 1 ? [
        ...Object.entries(counterparts).map(([locale, pathname]): ['link', Record<string, string>] => [
          'link',
          { rel: 'alternate', hreflang: locale === 'en-US' ? 'en' : locale, href: new URL(pathname, SITE_URL).toString() },
        ]),
        ['link', { rel: 'alternate', hreflang: 'x-default', href: new URL(counterparts['en-US'], SITE_URL).toString() }],
      ] : []
    const schema = isHomepage
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'SJF4J',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Cross-platform',
          description: summary,
          inLanguage: language,
          url: canonical,
          image: SOCIAL_IMAGE,
          codeRepository: repo,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description: summary,
          inLanguage: language,
          url: canonical,
          publisher: { '@type': 'Organization', name: 'SJF4J', url: SITE_URL },
        }

    return [
      ['link', { rel: 'canonical', href: canonical }],
      ...alternateLinks,
      ['meta', { name: 'robots', content: 'index, follow' }],
      ['meta', { property: 'og:type', content: isHomepage ? 'website' : 'article' }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:locale', content: path.startsWith('/zh/') ? 'zh_CN' : 'en_US' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: summary }],
      ['meta', { property: 'og:image', content: SOCIAL_IMAGE }],
      ['meta', { property: 'og:image:alt', content: 'SJF4J logo' }],
      ['meta', { property: 'og:image:type', content: 'image/png' }],
      ['meta', { property: 'og:image:width', content: '512' }],
      ['meta', { property: 'og:image:height', content: '512' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: summary }],
      ['meta', { name: 'twitter:image', content: SOCIAL_IMAGE }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(schema)],
    ]
  },

  // Documentation code fences use Shiki; the homepage has separate Prism panels.
  markdown: {
    theme: {
      light: 'github-light-high-contrast',
      dark: 'github-dark-high-contrast',
    },
    config(md) {
      installLocalizedMarkdownLinks(md)
      installMermaidFences(md)
    },
  },

  vite: {
    plugins: [checkHomepageChunks()],
    // Keep Mermaid's existing Vite interop settings without the plugin's
    // global component import. These dependencies are only used by diagrams.
    optimizeDeps: {
      include: ['@braintree/sanitize-url', 'dayjs', 'debug', 'cytoscape-cose-bilkent', 'cytoscape'],
    },
    resolve: {
      alias: {
        'dayjs/plugin/advancedFormat.js': 'dayjs/esm/plugin/advancedFormat',
        'dayjs/plugin/customParseFormat.js': 'dayjs/esm/plugin/customParseFormat',
        'dayjs/plugin/isoWeek.js': 'dayjs/esm/plugin/isoWeek',
        'cytoscape/dist/cytoscape.umd.js': 'cytoscape/dist/cytoscape.esm.js',
      },
    },
  },

  themeConfig: {
    // VitePress 1.x has only boolean i18nRouting. The shared navigation
    // component selects the corresponding page or target locale homepage.
    i18nRouting: false,
    siteTitle: 'S<span class="logo-java-j">J</span>F4J',
    socialLinks: [{ icon: 'github', link: repo }],
    search: {
      provider: 'local',
      options: { locales: { zh: { translations: zhSearchTranslations } } },
    },
    outline: { level: [2, 3] },
  },
})
