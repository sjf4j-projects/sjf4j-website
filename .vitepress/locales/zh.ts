// Until Chinese docs exist, navigation links intentionally target English pages.
export const zhLocale = {
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
}

export const zhSearchTranslations = {
  button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
  modal: {
    displayDetails: '显示详细列表',
    resetButtonTitle: '重置搜索',
    backButtonTitle: '关闭搜索',
    noResultsText: '没有结果',
    footer: {
      selectText: '选择',
      selectKeyAriaLabel: '回车',
      navigateText: '导航',
      navigateUpKeyAriaLabel: '上箭头',
      navigateDownKeyAriaLabel: '下箭头',
      closeText: '关闭',
      closeKeyAriaLabel: 'Esc',
    },
  },
}
