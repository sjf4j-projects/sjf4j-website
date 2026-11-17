<template>
  <div class="compiled-code-comparison" aria-label="Compiled Navigator source and generated Java example">
    <section class="compiled-code-panel">
      <div class="compiled-code-heading">
        <strong>Define Interface</strong>
        <span>Source</span>
      </div>
      <pre><code class="language-java" v-html="sourceHtml"></code></pre>
    </section>
    <section class="compiled-code-panel">
      <div class="compiled-code-heading">
        <strong>Generated Code</strong>
        <span>Illustrative</span>
      </div>
      <pre><code class="language-java" v-html="generatedHtml"></code></pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import Prism from 'prismjs'
import 'prismjs/components/prism-java'

const sourceCode = `@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}`

const generatedCode = `public final class UserNavigator_Impl
        implements UserNavigator {

    @Override
    public String getCity(User user) {
        if (user == null) return null;
        Address a = user.address;
        return a == null ? null : a.city;
    }
}`

// These static examples are authored here so both panels stay aligned.
// Generated code is simplified for readability, not a verbatim processor output.
const sourceHtml = Prism.highlight(sourceCode, Prism.languages.java, 'java')
const generatedHtml = Prism.highlight(generatedCode, Prism.languages.java, 'java')
</script>

<style scoped>
.compiled-code-comparison {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin: 22px 0 10px;
}

.compiled-code-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.compiled-code-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}

.compiled-code-heading strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.compiled-code-heading span {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.compiled-code-panel pre {
  min-height: 0;
  margin: 0;
  overflow-x: auto;
  background: var(--vp-code-block-bg);
}

.compiled-code-panel code {
  display: block;
  width: max-content;
  min-width: 100%;
  padding: 20px 16px;
  color: var(--vp-code-block-color);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.75;
  white-space: pre;
}

.compiled-code-panel :deep(.token.comment) {
  color: var(--vp-c-text-3);
}

.compiled-code-panel :deep(.token.keyword),
.compiled-code-panel :deep(.token.annotation),
.compiled-code-panel :deep(.token.class-name) {
  color: var(--vp-c-brand-1);
}

.compiled-code-panel :deep(.token.string) {
  color: var(--vp-c-green-1);
}
</style>
