<script setup lang="ts">
import { useChineseHome } from '../useHomeLanguage'

const zh = useChineseHome()
const zhHighlights: Record<string, { category: string; comparison: string }> = {
  'Data Binding': { category: '数据绑定', comparison: '对比直接使用 Jackson 2 · 100KB Users POJO 读取' },
  'GraalVM Native Image': { category: 'GraalVM 原生镜像', comparison: '对比直接使用 Jackson 2 · 100KB Users POJO 读取' },
  'JSONPath Navigation': { category: 'JSONPath 导航', comparison: '对比 SJF4J Runtime · 100KB POJO 直接查询' },
  'JSON Schema Validation': { category: 'JSON Schema 校验', comparison: '对比 SJF4J Runtime · Creek POJO 校验' },
  'Object Mapping': { category: '对象映射', comparison: '对比 MapStruct · 100KB 扩展 Order' },
  'JDBC Result Mapping': { category: 'JDBC 结果映射', comparison: '对比 Spring JDBC · 1,000 行 POJO' },
}

const highlights = [
  {
    category: 'Data Binding',
    speedup: '1.21×',
    comparison: 'vs. direct Jackson 2 · 100KB Users POJO read'
  },
  {
    category: 'GraalVM Native Image',
    speedup: '1.35×',
    comparison: 'vs. direct Jackson 2 · 100KB Users POJO read'
  },
  {
    category: 'JSONPath Navigation',
    speedup: '55.31×',
    comparison: 'vs. SJF4J Runtime · direct POJO lookup, 100KB'
  },
  {
    category: 'JSON Schema Validation',
    speedup: '53.6×',
    comparison: 'vs. SJF4J Runtime · Creek POJO validation'
  },
  {
    category: 'Object Mapping',
    speedup: '1.31×',
    comparison: 'vs. MapStruct · extended Order, 100KB'
  },
  {
    category: 'JDBC Result Mapping',
    speedup: '16.03×',
    comparison: 'vs. Spring JDBC · 1,000 POJO rows'
  }
]
</script>

<template>
  <div class="benchmark-highlights">
    <div v-for="item in highlights" :key="item.category" class="benchmark-highlight">
      <span class="benchmark-highlight-category">{{ zh ? zhHighlights[item.category].category : item.category }}</span>
      <strong>{{ item.speedup }}</strong>
      <small>{{ zh ? zhHighlights[item.category].comparison : item.comparison }}</small>
    </div>
  </div>

  <p v-if="zh" class="benchmark-caption">
    以上为特定测试场景下的性能比值，并非跨类别排名。各项测试的对比基准不同，详情请参阅图表与原始报告。
  </p>
  <p v-else class="benchmark-caption">
    Selected, workload-specific speedups, not a cross-category ranking. The comparison
    baseline is different in each case; see the charts and linked reports for details.
  </p>
</template>
