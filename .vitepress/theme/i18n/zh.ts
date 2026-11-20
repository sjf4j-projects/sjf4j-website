import type { SiteMessages } from './types'

export const zh: SiteMessages = {
  home: {
    sections: {
      exploreTitle: '探索功能',
      leadBefore: '通过灵活的 ',
      runtimeLabel: 'Runtime API',
      leadBetween: ' 和高性能的 ',
      compiledLabel: 'Compiled API',
      leadAfter: '，直接操作 Java 对象。',
      performanceTitle: '性能一览',
      benchmarkLink: '查看性能基准',
      springTitle: '在 Spring 中使用 SJF4J',
      springDescription: '将 SJF4J Compiled API 直接注入 Spring Bean，无需手动创建实例或添加组件注解。'
    },
    hero: {
      openSource: '开源',
      tagline: '统一的结构化数据处理层',
      taglineAccent: '基于 JSON 语义构建。',
      getStarted: '快速开始',
      benchmarks: '性能基准',
      badgeLabel: '项目状态与规范符合性徽章',
      featuresLabel: '核心优势',
      panels: [
        {
          id: 'semantics',
          title: 'JSON 语义，Java 对象',
          description: [
            '将 ',
            { text: 'JSONPath', href: 'https://www.rfc-editor.org/info/rfc9535/' },
            '、',
            { text: 'JSON Pointer', href: 'https://www.rfc-editor.org/info/rfc6901/' },
            '、',
            { text: 'JSON Patch', href: 'https://www.rfc-editor.org/info/rfc6902/' },
            ' 和 ',
            { text: 'JSON Schema', href: 'https://json-schema.org/' },
            ' 直接用于 POJO、Map、List 和领域模型，无需构造中间 JSON 树。'
          ]
        },
        {
          id: 'backends',
          title: '多种后端，统一 API',
          description: [
            '通过统一 API 使用多种 JSON 后端：',
            { text: 'Jackson 2.x/3.x', href: 'https://github.com/FasterXML/jackson-databind' },
            '、',
            { text: 'Gson', href: 'https://github.com/google/gson' },
            '、',
            { text: 'Fastjson2', href: 'https://github.com/alibaba/fastjson2' },
            '、',
            { text: 'JSON-P', href: 'https://github.com/jakartaee/jsonp-api' },
            '，以及 ',
            { text: 'SnakeYAML', href: 'https://github.com/snakeyaml/snakeyaml' },
            ' 等 YAML 和其他格式实现。'
          ]
        },
        {
          id: 'compiled',
          title: '运行时灵活，编译式高效',
          description: [
            '兼具灵活的 Runtime API 与高性能的 Compiled API。了解',
            { text: '功能', href: '/#explore-features' },
            '和',
            { text: '性能', href: '/#performance-at-a-glance' },
            '。'
          ]
        }
      ]
    },
    capabilities: {
      tabsLabel: 'SJF4J 功能',
      runtime: 'Runtime API',
      compiled: 'Compiled API',
      learnMore: name => `了解更多：${name}`,
      learnMoreLabel: name => `了解${name}详情`,
      items: {
        binding: {
          name: '数据绑定',
          description: ['通过统一 API 处理 JSON、YAML 和 Java Properties，支持 POJO、Map、List、泛型及自定义值类型。'],
          detail: [
            'SJF4J 通过开放的流式架构支持自定义格式和后端，同时提供 ',
            { code: '@OneOf' }, ' 多态绑定、', { code: 'ValueCodec' },
            ' 自定义值转换和 ', { code: 'ExternalNode' }, ' 集成。'
          ]
        },
        navigating: {
          name: '对象导航',
          description: [
            '使用 ',
            { text: 'JSONPath (RFC 9535)', href: 'https://www.rfc-editor.org/info/rfc9535' },
            ' 或 ',
            { text: 'JSON Pointer (RFC 6901)', href: 'https://www.rfc-editor.org/info/rfc6901' },
            ' 直接查询和修改 Java 对象，无需构造中间 JSON 树。'
          ]
        },
        validating: {
          name: '数据校验',
          description: [
            '使用 ', { text: 'JSON Schema', href: 'https://json-schema.org/' },
            ' 直接校验 Java 对象，支持 Draft 2020-12、2019-09 和 7。'
          ]
        },
        'object-mapping': {
          name: '对象映射',
          description: ['在 Map、POJO、普通值及嵌套 Java 对象之间进行转换。'],
          detail: [
            'Runtime API ', { code: 'Sjf4j.convert()' }, ' 支持直接对象转换。',
            { break: true }, { code: '@CompiledMapper' }, ' 支持属性重命名、嵌套映射、表达式和对象创建等自定义规则。'
          ]
        },
        'jdbc-result-mapping': {
          name: 'JDBC 结果映射',
          description: ['通过 @CompiledJdbcMapper 生成从 JDBC ResultSet 到 Java 对象的直接映射。']
        },
        patching: {
          name: '对象补丁',
          description: [
            '将 ',
            { text: 'JSON Patch (RFC 6902)', href: 'https://www.rfc-editor.org/info/rfc6902' },
            '、',
            { text: 'JSON Merge Patch (RFC 7386)', href: 'https://www.rfc-editor.org/info/rfc7386' },
            ' 和 Indexed Merge Patch 直接应用于 Java 对象。'
          ],
          detail: ['对象补丁目前仅支持 Runtime API，尚无 Compiled API。']
        },
        modeling: {
          name: '对象模型',
          description: ['按照统一的 JSON 语义访问、遍历和比较 Java 对象。']
        }
      },
      modeling: {
        label: 'OBNT 对象模型',
        introduction: '是 SJF4J 的统一结构模型，包含三种节点：',
        nodeType: '节点类型',
        javaRepresentation: 'Java 表示形式',
        objectNode: 'Object Node',
        arrayNode: 'Array Node',
        valueNode: 'Value Node',
        valueTypes: '字符串、数字、布尔值和自定义值类型',
        extensions: 'OBNT 同时支持可扩展的对象模型：',
        jojo: '继承 JsonObject，同时支持类型化属性和动态成员。',
        jajo: '继承 JsonArray，提供类型化、可扩展的数组。',
        nodeValue: '将自定义类型定义为 Value Node。',
        oneOf: '定义多态节点类型。',
        externalNode: '集成自定义结构类型。'
      }
    },
    benchmarks: {
      items: {
        binding: { label: '数据绑定', comparison: '对比直接使用 Jackson 2 · 100KB Users POJO 读取' },
        native: { label: 'GraalVM Native Image', comparison: '对比直接使用 Jackson 2 · 100KB Users POJO 读取' },
        navigation: { label: 'JSONPath 导航', comparison: '对比 SJF4J Runtime · 100KB POJO 直接查询' },
        validation: { label: 'JSON Schema 校验', comparison: '对比 SJF4J Runtime · Creek POJO 校验' },
        mapping: { label: '对象映射', comparison: '对比 MapStruct · 100KB 扩展 Order' },
        jdbc: { label: 'JDBC 结果映射', comparison: '对比 Spring JDBC · 1,000 行 POJO' }
      },
      caption: '以上为特定测试场景下的性能比值，并非跨类别排名。各项测试的对比基准不同，详情请参阅图表与原始报告。'
    },
    spring: {
      label: 'Spring 集成示例',
      define: '定义接口',
      use: '在 Spring 中使用',
      notes: ['自动注册 Bean', '编译期生成实现类', '标准 Spring 依赖注入'],
      link: 'Spring 集成文档'
    }
  },
  code: {
    copy: '复制',
    copied: '已复制',
    copyLabel: title => `复制${title}示例`
  }
}
