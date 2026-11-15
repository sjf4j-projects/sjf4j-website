<template>
  <section class="home-showcase" aria-labelledby="home-headline">
    <header class="showcase-intro">
      <p class="eyebrow">Java 8+ <span aria-hidden="true">·</span> Open Source</p>
      <p class="project-name">SJF4J <span>— Simple JSON Facade for Java</span></p>
      <h1 id="home-headline">
        A unified structural processing layer
        <span class="headline-emphasis">built on JSON semantics.</span>
      </h1>
      <div class="actions">
        <a class="primary" href="/docs/quickstart">Get Started</a>
        <a
          class="secondary"
          href="https://github.com/sjf4j-projects/sjf4j"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 1C5.925 1 1 5.925 1 12c0 4.86 3.148 8.982 7.518 10.436.55.096.756-.239.756-.534 0-.266-.01-.97-.015-1.904-3.06.665-3.706-1.474-3.706-1.474-.5-1.27-1.222-1.608-1.222-1.608-.998-.682.076-.668.076-.668 1.103.078 1.684 1.133 1.684 1.133.98 1.678 2.572 1.193 3.2.912.1-.71.384-1.193.699-1.468-2.443-.278-5.012-1.222-5.012-5.438 0-1.201.43-2.183 1.133-2.952-.114-.278-.491-1.397.108-2.91 0 0 .923-.295 3.023 1.128a10.5 10.5 0 0 1 5.503 0c2.1-1.423 3.02-1.128 3.02-1.128.6 1.513.223 2.632.109 2.91.704.769 1.131 1.751 1.131 2.952 0 4.227-2.574 5.157-5.024 5.429.394.34.744 1.011.744 2.037 0 1.47-.014 2.656-.014 3.018 0 .296.198.636.762.53C19.854 20.98 23 16.86 23 12c0-6.075-4.925-11-11-11z"/>
          </svg>
          GitHub
        </a>
      </div>
    </header>

    <div class="feature-panels" aria-label="Key advantages">
      <article class="feature-panel">
        <h2>JSON Semantics</h2>
        <p class="feature-tagline">Native Java Objects</p>
        <p class="feature-description">
          Apply JSONPath, JSON Pointer, JSON Patch and JSON Schema directly to
          POJOs, Maps and Lists. No intermediate JSON tree.
        </p>
      </article>
      <article class="feature-panel">
        <h2>Multiple Backends</h2>
        <p class="feature-tagline">One Unified API</p>
        <p class="feature-description">
          Bind through Jackson 2/3, Gson, Fastjson2 or JSON-P, and work with
          YAML via SnakeYAML — using the same facade.
        </p>
      </article>
      <article class="feature-panel">
        <h2>Runtime Flexibility</h2>
        <p class="feature-tagline">Compiled Speed</p>
        <p class="feature-description">
          Use flexible runtime operations or generate optimized Java code
          for binding, navigation, validation and mapping.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-showcase {
  max-width: 1100px;
  margin: 0 auto;
  padding: 33px 0 16px;
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

.project-name {
  margin: 18px 0 0;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.45;
}

.project-name span {
  color: var(--vp-c-text-2);
  font-weight: 450;
}

.showcase-intro h1 {
  max-width: 960px;
  margin: 12px auto 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(33px, 4.4vw, 50px);
  font-weight: 750;
  letter-spacing: -0.036em;
  line-height: 1.18;
}

.headline-emphasis {
  color: var(--vp-c-brand-1);
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
  gap: 9px;
  min-width: 124px;
  padding: 10px 18px;
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

.feature-panels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 35px auto 0;
}

.feature-panel {
  min-width: 0;
  padding: 21px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 11px;
  background: var(--vp-c-bg-soft);
  text-align: left;
}

.feature-panel h2 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
}

.feature-tagline {
  margin: 3px 0 0;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
}

.feature-description {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 760px) {
  .home-showcase {
    padding-top: 25px;
  }

  .feature-panels {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 28px;
  }

  .feature-panel {
    padding: 18px 19px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .actions a {
    transition: none;
  }
}
</style>
