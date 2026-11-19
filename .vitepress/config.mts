import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const repo = 'https://github.com/sjf4j-projects/sjf4j'
const SITE_URL = 'https://sjf4j.org'
const SOCIAL_IMAGE = SITE_URL + '/brand/sjf4j-square-512x512.png'
const DEFAULT_DESCRIPTION = 'A unified structural processing layer built on JSON semantics.'
function pagePath(relativePath: string): string {
  if (relativePath === 'index.md') return '/'
  if (relativePath.endsWith('/index.md')) return '/' + relativePath.slice(0, -'index.md'.length)
  return '/' + relativePath.replace(/\.md$/, '')
}

export default withMermaid(defineConfig({
  title: 'SJF4J',
  description: DEFAULT_DESCRIPTION,
  lang: 'en-US',
  // Keep the existing English URLs; translate pages incrementally under /zh/.
  locales: {
    root: { label: 'English', lang: 'en-US' },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '基于 JSON 语义的统一结构化数据处理层。',
      markdown: {
        codeCopyButton: {
          tooltipText: '复制代码',
          copiedText: '已复制',
        },
      },
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '文档', link: '/docs/getting-started' },
          { text: '性能测试', link: '/docs/benchmarks' },
          { text: '代码生成器', link: '/generator' },
        ],
        langMenuLabel: '选择语言',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        footer: {
          message: '基于 MIT 许可证发布。',
          copyright: 'SJF4J contributors',
        },
      },
    },
  },
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
    const alternateLinks: Array<['link', Record<string, string>]> = isHomepage ? [
      ['link', { rel: 'alternate', hreflang: 'en', href: SITE_URL + '/' }],
      ['link', { rel: 'alternate', hreflang: 'zh-CN', href: SITE_URL + '/zh/' }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: SITE_URL + '/' }],
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
  },

  themeConfig: {
    // Only /zh/ exists so far. Switch to the available locale homepage,
    // rather than navigating to untranslated /zh/docs/... URLs.
    i18nRouting: false,
    siteTitle: 'S<span class="logo-java-j">J</span>F4J',
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
    socialLinks: [{ icon: 'github', link: repo }],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'SJF4J contributors',
    },
  },
}))
