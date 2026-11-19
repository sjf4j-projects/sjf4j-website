import type { SiteMessages } from './types'

export const en: SiteMessages = {
  home: {
    hero: {
      openSource: 'Open Source',
      tagline: 'A unified structural processing layer',
      taglineAccent: 'built on JSON semantics.',
      getStarted: 'Get Started',
      benchmarks: 'Benchmarks',
      badgeLabel: 'Project status and compliance badges',
      featuresLabel: 'Key advantages',
      panels: [
        {
          id: 'semantics',
          title: 'JSON Semantics, Java Objects',
          description: [
            'Apply ',
            { text: 'JSONPath', href: 'https://www.rfc-editor.org/info/rfc9535/' },
            ', ',
            { text: 'JSON Pointer', href: 'https://www.rfc-editor.org/info/rfc6901/' },
            ', ',
            { text: 'JSON Patch', href: 'https://www.rfc-editor.org/info/rfc6902/' },
            ', and ',
            { text: 'JSON Schema', href: 'https://json-schema.org/' },
            ' directly to POJOs, Maps, Lists, and domain models — no intermediate JSON trees required.'
          ]
        },
        {
          id: 'backends',
          title: 'Multiple Backends, One API',
          description: [
            'Work seamlessly across JSON backends (',
            { text: 'Jackson 2.x/3.x', href: 'https://github.com/FasterXML/jackson-databind' },
            ', ',
            { text: 'Gson', href: 'https://github.com/google/gson' },
            ', ',
            { text: 'Fastjson2', href: 'https://github.com/alibaba/fastjson2' },
            ', ',
            { text: 'JSON-P', href: 'https://github.com/jakartaee/jsonp-api' },
            '), YAML (',
            { text: 'SnakeYAML', href: 'https://github.com/snakeyaml/snakeyaml' },
            '), and other formats — all through a unified API.'
          ]
        },
        {
          id: 'compiled',
          title: 'Runtime Flexibility, Compiled Speed',
          description: [
            'Enjoy flexible runtime APIs and highly optimized compile-time code generation — explore ',
            { text: 'features', href: '/#explore-features' },
            ' and ',
            { text: 'performance', href: '/#performance-at-a-glance' },
            '.'
          ]
        }
      ]
    },
    capabilities: {
      tabsLabel: 'SJF4J capabilities',
      runtime: 'Runtime API',
      compiled: 'Compiled API',
      learnMore: name => `Learn more about ${name}`,
      learnMoreLabel: name => `Learn more about ${name}`,
      items: {
        binding: {
          name: 'Binding',
          description: [
            'Unified data binding across ',
            { text: 'JSON', href: 'https://www.rfc-editor.org/info/rfc8259' },
            ', ',
            { text: 'YAML', href: 'https://yaml.org/spec/1.2.2/' },
            ', and ',
            { text: 'Java Properties', href: 'https://docs.oracle.com/javase/8/docs/api/java/util/Properties.html' },
            ', supporting POJOs, Maps, Lists, generic types, and custom value types.'
          ],
          detail: [
            "SJF4J's open streaming architecture supports custom data formats and backends. Its rich binding capabilities include ",
            { code: '@OneOf' }, ' polymorphism, multi-format ', { code: 'ValueCodec' },
            ' support, and fully managed ', { code: 'ExternalNode' }, ' integration.'
          ]
        },
        navigating: {
          name: 'Navigating',
          description: [
            'Query and modify Java object graphs with ',
            { text: 'JSONPath (RFC 9535)', href: 'https://www.rfc-editor.org/info/rfc9535' },
            ' or ',
            { text: 'JSON Pointer (RFC 6901)', href: 'https://www.rfc-editor.org/info/rfc6901' },
            ', without intermediate JSON trees.'
          ]
        },
        validating: {
          name: 'Validating',
          description: [
            'Validate Java objects directly against ',
            { text: 'JSON Schema', href: 'https://json-schema.org/' },
            ' (drafts 2020-12, 2019-09, and 7), without constructing intermediate JSON trees.'
          ]
        },
        'object-mapping': {
          name: 'Object Mapping',
          description: ['Convert between Maps, POJOs, values, and nested Java structures.'],
          detail: [
            'The Runtime API, ', { code: 'Sjf4j.convert()' }, ', performs direct object conversion.',
            { break: true },
            { code: '@CompiledMapper' },
            ' supports custom mapping rules for property renaming, nested mappings, expressions, and object creation.'
          ]
        },
        'jdbc-result-mapping': {
          name: 'JDBC Result Mapping',
          description: ['Generate direct mappings from JDBC ResultSet rows to Java objects with @CompiledJdbcMapper.']
        },
        patching: {
          name: 'Patching',
          description: [
            'Apply ',
            { text: 'JSON Patch (RFC 6902)', href: 'https://www.rfc-editor.org/info/rfc6902' },
            ', ',
            { text: 'JSON Merge Patch (RFC 7386)', href: 'https://www.rfc-editor.org/info/rfc7386' },
            ', and indexed merge operations directly to Java object graphs.'
          ],
          detail: ['Patching is available through the Runtime API only; there is no Compiled API.']
        },
        modeling: {
          name: 'Modeling',
          description: ['Access, traverse, and compare Java objects through a consistent API that follows JSON semantics.']
        }
      },
      modeling: {
        label: 'OBNT model overview',
        introduction: "is the unified structural model behind SJF4J's APIs. It defines three kinds of nodes:",
        nodeType: 'Node kind',
        javaRepresentation: 'Java representations',
        objectNode: 'Object Node',
        arrayNode: 'Array Node',
        valueNode: 'Value Node',
        valueTypes: 'Strings, numbers, booleans, custom value types',
        extensions: 'OBNT also supports extensible object models:',
        jojo: 'extends JsonObject with typed properties and dynamic members.',
        jajo: 'extends JsonArray for typed, extensible arrays.',
        nodeValue: 'defines logical value nodes.',
        oneOf: 'models polymorphic node types.',
        externalNode: 'integrates custom structural types.'
      }
    },
    benchmarks: {
      items: {
        binding: { label: 'Data Binding', comparison: 'vs. direct Jackson 2 · 100KB Users POJO read' },
        native: { label: 'GraalVM Native Image', comparison: 'vs. direct Jackson 2 · 100KB Users POJO read' },
        navigation: { label: 'JSONPath Navigation', comparison: 'vs. SJF4J Runtime · direct POJO lookup, 100KB' },
        validation: { label: 'JSON Schema Validation', comparison: 'vs. SJF4J Runtime · Creek POJO validation' },
        mapping: { label: 'Object Mapping', comparison: 'vs. MapStruct · extended Order, 100KB' },
        jdbc: { label: 'JDBC Result Mapping', comparison: 'vs. Spring JDBC · 1,000 POJO rows' }
      },
      caption: 'Selected, workload-specific speedups, not a cross-category ranking. The comparison baseline is different in each case; see the charts and linked reports for details.'
    },
    spring: {
      label: 'Spring Boot integration example',
      define: 'Define Interface',
      use: 'Use in Spring',
      notes: ['Automatic bean registration', 'Compile-time generated implementations', 'Standard Spring dependency injection'],
      link: 'Spring Integration'
    }
  },
  code: {
    copy: 'Copy',
    copied: 'Copied',
    copyLabel: title => `Copy ${title} example`
  }
}
