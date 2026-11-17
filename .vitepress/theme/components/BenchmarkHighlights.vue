<script setup lang="ts">
const highlights = [
  {
    category: 'Data Binding',
    speedup: '1.16×',
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
      <span class="benchmark-highlight-category">{{ item.category }}</span>
      <strong>{{ item.speedup }}</strong>
      <small>{{ item.comparison }}</small>
    </div>
  </div>

  <p class="benchmark-caption">
    Selected, workload-specific speedups, not a cross-category ranking. The comparison
    baseline is different in each case; see the charts and linked reports for details.
  </p>
</template>
