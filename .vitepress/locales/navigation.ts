import { localizedLink } from '../i18n/routes.ts'

/**
 * One documentation navigation tree for every language.
 * English is the source page inventory; translated labels are presentation.
 */
export const docsNavigation = [
  {
    title: { en: 'Introduction', zh: '入门' },
    pages: [
      { title: { en: 'Getting Started', zh: '快速开始' }, link: '/docs/getting-started' },
      { title: { en: 'Installation', zh: '安装' }, link: '/docs/installation' },
      { title: { en: 'Modeling (OBNT)', zh: '对象模型 (OBNT)' }, link: '/docs/modeling' },
      { title: { en: 'Compiled APIs', zh: '编译式 API' }, link: '/docs/compiled' },
      { title: { en: 'Benchmarks', zh: '性能测试' }, link: '/docs/benchmarks' },
    ],
  },
  {
    title: { en: 'Features', zh: '核心功能' },
    pages: [
      { title: { en: 'Binding', zh: '数据绑定' }, link: '/docs/binding' },
      { title: { en: 'Navigating', zh: '对象导航' }, link: '/docs/navigating' },
      { title: { en: 'Validating', zh: '数据校验' }, link: '/docs/validating' },
      { title: { en: 'Object Mapping', zh: '对象映射' }, link: '/docs/mapping' },
      { title: { en: 'JDBC Result Mapping', zh: 'JDBC 结果映射' }, link: '/docs/jdbc-mapping' },
      { title: { en: 'Patching', zh: '对象补丁' }, link: '/docs/patching' },
    ],
  },
  {
    title: { en: 'Integrations', zh: '集成与扩展' },
    pages: [
      { title: { en: 'Backends & Formats', zh: '后端与格式' }, link: '/docs/backends' },
      { title: { en: 'Value Codecs', zh: '值转换器' }, link: '/docs/value-codecs' },
      { title: { en: 'External Nodes', zh: '外部节点' }, link: '/docs/external-nodes' },
      { title: { en: 'Spring Integration', zh: 'Spring 集成' }, link: '/docs/spring-integration' },
    ],
  },
  {
    title: { en: 'Reference', zh: '参考资料' },
    pages: [
      { title: { en: 'FAQ', zh: '常见问题' }, link: '/docs/faq' },
      { title: { en: 'Javadocs', zh: 'Javadocs' }, link: 'https://javadoc.io/doc/org.sjf4j/sjf4j-core' },
      { title: { en: 'Changelog', zh: '更新日志' }, link: 'https://github.com/sjf4j-projects/sjf4j/blob/main/CHANGELOG.md' },
    ],
  },
] as const

export function createSidebar(language: 'en-US' | 'zh-CN') {
  const key = language === 'zh-CN' ? 'zh' : 'en'
  return docsNavigation.map(section => ({
    text: section.title[key],
    items: section.pages.map(page => ({
      text: page.title[key],
      link: localizedLink(page.link, language),
    })),
  }))
}
