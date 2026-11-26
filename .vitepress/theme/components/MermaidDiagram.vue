<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{ graph: string }>()
const { isDark, frontmatter } = useData()
const id = `mermaid-${useId()}`
const svg = ref('')
const failed = ref(false)
let revision = 0
let stop: (() => void) | undefined

onMounted(() => {
  stop = watch([() => props.graph, isDark, () => frontmatter.value.mermaidTheme], async () => {
    const current = ++revision
    failed.value = false
    try {
      // Never evaluate Mermaid during SSR or on a page without a diagram.
      const { default: mermaid } = await import('mermaid')
      if (current !== revision) return
      mermaid.initialize({
        startOnLoad: false,
        // The diagrams are trusted repository content and use HTML labels.
        securityLevel: 'loose',
        theme: isDark.value ? 'dark' : (frontmatter.value.mermaidTheme ?? 'default'),
      })
      const result = await mermaid.render(`${id}-${current}`, decodeURIComponent(props.graph))
      if (current === revision) svg.value = result.svg
    } catch (error) {
      if (current === revision) {
        svg.value = ''
        failed.value = true
        console.error('Mermaid diagram could not be rendered', error)
      }
    }
  }, { immediate: true })
})

onBeforeUnmount(() => {
  revision++
  stop?.()
})
</script>

<template>
  <div class="mermaid" :aria-busy="!svg && !failed">
    <div v-if="svg" v-html="svg"></div>
    <pre v-else-if="failed">{{ decodeURIComponent(graph) }}</pre>
    <span v-else>Loading diagram…</span>
  </div>
</template>
