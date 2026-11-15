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
  <div class="home-showcase">
    <header class="showcase-intro">
      <p class="eyebrow">Java 8+ <span aria-hidden="true">·</span> Open Source</p>
      <h1>Simple JSON Facade for Java</h1>
      <p class="tagline">A unified structural processing layer built on JSON semantics.</p>
      <div class="actions">
        <a class="primary" href="/docs/quickstart">Get Started</a>
        <a
          class="secondary"
          href="https://github.com/sjf4j-projects/sjf4j"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </header>

    <div class="principles" aria-label="Key advantages">
      <div class="principle">
        <strong>JSON Semantics</strong>
        <span>Native Java Objects</span>
      </div>
      <div class="principle">
        <strong>Multiple Backends</strong>
        <span>One Unified API</span>
      </div>
      <div class="principle">
        <strong>Runtime Flexibility</strong>
        <span>Compiled Speed</span>
      </div>
    </div>

    <section class="example" aria-labelledby="home-example-title">
      <div class="example-heading">
        <h2 id="home-example-title">Work with ordinary Java objects</h2>
        <span class="language">Java</span>
      </div>
      <div class="code-box">
        <button class="copy" type="button" :aria-label="copied ? 'Copied code' : 'Copy code'" @click="copySnippet">
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
        <pre><code><span class="type">User</span> user = sjf4j.<span class="method">fromJson</span>(json, <span class="type">User</span>.class);

<span class="type">JsonPath</span>.<span class="method">parse</span>(<span class="string">"$.address.city"</span>)
        .<span class="method">put</span>(user, <span class="string">"Shanghai"</span>);</code></pre>
      </div>
      <p class="example-caption">No special base class or intermediate JSON tree required.</p>
    </section>
  </div>
</template>

<style scoped>
.home-showcase {
  max-width: 1040px;
  margin: 0 auto;
  padding: 38px 0 10px;
}

.showcase-intro {
  text-align: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.showcase-intro h1 {
  margin: 22px 0 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(32px, 4.6vw, 52px);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1.16;
}

.tagline {
  margin: 15px auto 0;
  max-width: 760px;
  color: var(--vp-c-text-2);
  font-size: clamp(16px, 1.85vw, 19px);
  line-height: 1.55;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 23px;
}

.actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  padding: 10px 19px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.actions .primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.actions .primary:hover {
  background: var(--vp-c-brand-2);
  color: var(--vp-c-white);
}

.actions .secondary {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.actions .secondary:hover {
  border-color: var(--vp-c-brand-1);
}

.principles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 39px auto 0;
  padding: 21px 0;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.principle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  padding: 0 12px;
  text-align: center;
}

.principle + .principle {
  border-left: 1px solid var(--vp-c-divider);
}

.principle strong {
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;
}

.principle span {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.example {
  margin-top: 29px;
  padding: 23px 26px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.example-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.example-heading h2 {
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

.example-caption {
  margin: 13px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 700px) {
  .home-showcase {
    padding-top: 24px;
  }

  .showcase-intro h1 {
    margin-top: 19px;
  }

  .principles {
    margin-top: 31px;
  }

  .principle {
    padding: 0 7px;
  }

  .principle strong {
    font-size: 13px;
  }

  .principle span {
    font-size: 12px;
  }

  .example {
    padding: 18px 15px;
  }

  .code-box pre {
    padding: 23px 14px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .principles {
    gap: 15px;
    grid-template-columns: 1fr;
    padding: 17px 0;
  }

  .principle + .principle {
    padding-top: 15px;
    border-top: 1px solid var(--vp-c-divider);
    border-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .actions a {
    transition: none;
  }
}
</style>
