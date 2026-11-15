<script setup lang="ts">
import { ref } from 'vue'

const snippet = 'User user = sjf4j.fromJson(json, User.class);\n\nJsonPath.parse("$.address.city")\n        .put(user, "Shanghai");'
const copied = ref(false)

async function copySnippet() {
  try {
    await navigator.clipboard.writeText(snippet)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section class="quickstart-example" aria-labelledby="home-example-heading">
    <div class="example-heading">
      <h3 id="home-example-heading">Work with ordinary Java objects</h3>
      <span class="language">Java</span>
    </div>
    <div class="code-box">
      <button
        class="copy"
        type="button"
        :aria-label="copied ? 'Copied code' : 'Copy code'"
        @click="copySnippet"
      >{{ copied ? 'Copied' : 'Copy' }}</button>
      <pre><code><span class="type">User</span> user = sjf4j.<span class="method">fromJson</span>(json, <span class="type">User</span>.class);

<span class="type">JsonPath</span>.<span class="method">parse</span>(<span class="string">"$.address.city"</span>)
        .<span class="method">put</span>(user, <span class="string">"Shanghai"</span>);</code></pre>
    </div>
    <p class="caption">No special base class or intermediate JSON tree required.</p>
  </section>
</template>

<style scoped>
.quickstart-example {
  padding: 22px 25px 19px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.example-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.example-heading h3 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.5;
}

.language {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.code-box {
  position: relative;
  overflow-x: auto;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
}

.code-box pre {
  margin: 0;
  padding: 23px 22px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.8;
  white-space: pre;
  tab-size: 4;
}

.type {
  color: var(--vp-c-brand-1);
}

.method {
  color: var(--vp-c-text-1);
}

.string {
  color: var(--vp-c-text-2);
}

.copy {
  position: absolute;
  top: 9px;
  right: 10px;
  padding: 4px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 11px;
}

.copy:hover {
  color: var(--vp-c-brand-1);
}

.caption {
  margin: 13px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 700px) {
  .quickstart-example {
    padding: 18px 15px;
  }

  .code-box pre {
    padding: 23px 14px;
    font-size: 12px;
  }
}
</style>
