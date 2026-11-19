// Page copy only. Domain data, code examples, links and layout belong elsewhere.
export type RichPart = string | { text: string; href: string } | { code: string } | { break: true }

export type CapabilityId =
  | 'binding' | 'navigating' | 'validating' | 'object-mapping'
  | 'jdbc-result-mapping' | 'patching' | 'modeling'

export type BenchmarkId =
  | 'binding' | 'native' | 'navigation' | 'validation' | 'mapping' | 'jdbc'

export interface SiteMessages {
  home: {
    hero: {
      openSource: string
      tagline: string
      taglineAccent: string
      getStarted: string
      benchmarks: string
      badgeLabel: string
      featuresLabel: string
      panels: Array<{ id: string; title: string; description: RichPart[] }>
    }
    capabilities: {
      tabsLabel: string
      runtime: string
      compiled: string
      learnMore: (name: string) => string
      learnMoreLabel: (name: string) => string
      items: Record<CapabilityId, { name: string; description: RichPart[]; detail?: RichPart[] }>
      modeling: {
        label: string
        introduction: string
        nodeType: string
        javaRepresentation: string
        objectNode: string
        arrayNode: string
        valueNode: string
        valueTypes: string
        extensions: string
        jojo: string
        jajo: string
        nodeValue: string
        oneOf: string
        externalNode: string
      }
    }
    benchmarks: {
      items: Record<BenchmarkId, { label: string; comparison: string }>
      caption: string
    }
    spring: {
      label: string
      define: string
      use: string
      notes: [string, string, string]
      link: string
    }
  }
  code: {
    copy: string
    copied: string
    copyLabel: (title: string) => string
  }
}
