<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  language?: string
  code?: string
  note?: string
}>(), {
  language: 'Java',
  code: '',
  note: ''
})

const copied = ref(false)

async function copyCode() {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="home-code-panel">
    <div class="panel-header">
      <strong>{{ title }}</strong>
      <span class="panel-meta">
        <span v-if="code" class="language">{{ language }}</span>
        <button v-if="code" type="button" @click="copyCode" :aria-label="`Copy ${title} example`">
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </span>
    </div>
    <pre v-if="code"><code>{{ code }}</code></pre>
    <div v-else class="panel-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.home-code-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-code-block-bg);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.panel-header strong {
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 650;
}

.panel-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

button {
  padding: 3px 7px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 11px;
}

button:hover {
  color: var(--vp-c-brand-1);
}

pre {
  flex: 1;
  overflow-x: auto;
  min-height: 80px;
  margin: 0;
  padding: 17px 16px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.7;
  tab-size: 4;
  white-space: pre;
}

.panel-note {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 80px;
  padding: 16px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}
</style>
