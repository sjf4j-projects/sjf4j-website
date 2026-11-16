<script setup lang="ts">
import { computed, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-kotlin'

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

const highlightedCode = computed(() => {
  const lang = props.language.toLowerCase()
  const grammar = lang === 'kotlin'
    ? Prism.languages.kotlin
    : lang === 'xml'
      ? Prism.languages.markup
      : Prism.languages.java

  // Prism escapes source text when producing highlighted HTML.
  return Prism.highlight(props.code, grammar, lang)
})

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
    <pre v-if="code"><code v-html="highlightedCode"></code></pre>
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
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 14px;
  line-height: 1.6;
}

pre :deep(.token.comment),
pre :deep(.token.prolog),
pre :deep(.token.doctype) {
  color: #6a737d;
}

pre :deep(.token.keyword),
pre :deep(.token.annotation),
pre :deep(.token.boolean) {
  color: #cf222e;
}

pre :deep(.token.string),
pre :deep(.token.char) {
  color: #0a3069;
}

pre :deep(.token.class-name),
pre :deep(.token.builtin),
pre :deep(.token.function) {
  color: #8250df;
}

pre :deep(.token.number),
pre :deep(.token.constant),
pre :deep(.token.attr-value) {
  color: #0550ae;
}

pre :deep(.token.tag),
pre :deep(.token.attr-name) {
  color: #116329;
}

:global(.dark) pre :deep(.token.comment),
:global(.dark) pre :deep(.token.prolog),
:global(.dark) pre :deep(.token.doctype) {
  color: #8b949e;
}

:global(.dark) pre :deep(.token.keyword),
:global(.dark) pre :deep(.token.annotation),
:global(.dark) pre :deep(.token.boolean) {
  color: #ff7b72;
}

:global(.dark) pre :deep(.token.string),
:global(.dark) pre :deep(.token.char) {
  color: #a5d6ff;
}

:global(.dark) pre :deep(.token.class-name),
:global(.dark) pre :deep(.token.builtin),
:global(.dark) pre :deep(.token.function) {
  color: #d2a8ff;
}

:global(.dark) pre :deep(.token.number),
:global(.dark) pre :deep(.token.constant),
:global(.dark) pre :deep(.token.attr-value) {
  color: #79c0ff;
}

:global(.dark) pre :deep(.token.tag),
:global(.dark) pre :deep(.token.attr-name) {
  color: #7ee787;
}
</style>
