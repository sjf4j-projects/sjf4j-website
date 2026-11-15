<template>
  <section class="home-showcase" aria-labelledby="home-headline">
    <div class="hero-intro">
      <p class="eyebrow">Java 8+ <span aria-hidden="true">·</span> Open Source</p>
      <h1 id="home-headline">SJF4J</h1>
      <p class="project-name">Simple JSON Facade for Java</p>
      <p class="tagline">
        A unified structural processing layer
        <span class="accent tagline-end">built on JSON semantics.</span>
      </p>
      <div class="actions">
        <a class="primary" href="/docs/quickstart">Get Started <span aria-hidden="true">→</span></a>
        <a class="secondary" href="/docs/benchmarks"><span aria-hidden="true">⚡️</span> Benchmarks</a>
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
      <div class="project-badges" aria-label="Project status and compliance badges">
        <div class="badge-row">
        <a href="https://github.com/sjf4j-projects/sjf4j/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/license/sjf4j-projects/sjf4j" alt="License" loading="lazy" />
        </a>
        <a href="https://central.sonatype.com/search?q=sjf4j" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central" loading="lazy" />
        </a>
        <a href="https://javadoc.io/doc/org.sjf4j/sjf4j-core" target="_blank" rel="noopener noreferrer">
          <img src="https://javadoc.io/badge2/org.sjf4j/sjf4j-core/javadoc.svg" alt="Javadoc" loading="lazy" />
        </a>
        <a href="https://github.com/sjf4j-projects/sjf4j/stargazers" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/stars/sjf4j-projects/sjf4j?style=social" alt="GitHub stars" loading="lazy" />
        </a>
        </div>
        <div class="badge-row">
        <a href="https://bowtie.report/" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fsupported_versions.json" alt="Supported JSON Schema dialects" loading="lazy" />
        </a>
        <a href="https://bowtie.report/" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft2020-12.json" alt="JSON Schema Draft 2020-12 compliance" loading="lazy" />
        </a>
        <a href="https://bowtie.report/" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft2019-09.json" alt="JSON Schema Draft 2019-09 compliance" loading="lazy" />
        </a>
        <a href="https://bowtie.report/" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft7.json" alt="JSON Schema Draft 7 compliance" loading="lazy" />
        </a>
        </div>
        <div class="badge-row">
        <a href="https://github.com/sjf4j-projects/sjf4j/actions/workflows/gradle.yml" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/actions/workflow/status/sjf4j-projects/sjf4j/gradle.yml?branch=main" alt="Build status" loading="lazy" />
        </a>
        <a href="https://codecov.io/gh/sjf4j-projects/sjf4j" target="_blank" rel="noopener noreferrer">
          <img src="https://codecov.io/gh/sjf4j-projects/sjf4j/graph/badge.svg?branch=main" alt="Code coverage" loading="lazy" />
        </a>
        </div>
      </div>
    </div>

    <div class="feature-panels" aria-label="Key advantages">
      <article class="feature-panel">
        <h2>JSON Semantics, Java Objects</h2>
        <p>
          Apply <a href="https://www.rfc-editor.org/info/rfc9535/" target="_blank" rel="noopener noreferrer">JSONPath</a>,
          <a href="https://www.rfc-editor.org/info/rfc6901/" target="_blank" rel="noopener noreferrer">JSON Pointer</a>,
          <a href="https://www.rfc-editor.org/info/rfc6902/" target="_blank" rel="noopener noreferrer">JSON Patch</a>,
          and <a href="https://json-schema.org/" target="_blank" rel="noopener noreferrer">JSON Schema</a>
          directly to POJOs, Maps, Lists, and domain models — no intermediate JSON trees required.
        </p>
      </article>

      <article class="feature-panel">
        <h2>Multiple Backends, One API</h2>
        <p>
          Work seamlessly across JSON backends
          (<a href="https://github.com/FasterXML/jackson-databind" target="_blank" rel="noopener noreferrer">Jackson 2.x/3.x</a>,
          <a href="https://github.com/google/gson" target="_blank" rel="noopener noreferrer">Gson</a>,
          <a href="https://github.com/alibaba/fastjson2" target="_blank" rel="noopener noreferrer">Fastjson2</a>,
          <a href="https://github.com/jakartaee/jsonp-api" target="_blank" rel="noopener noreferrer">JSON-P</a>),
          YAML (<a href="https://github.com/snakeyaml/snakeyaml" target="_blank" rel="noopener noreferrer">SnakeYAML</a>),
          and other formats — all through a unified API.
        </p>
      </article>

      <article class="feature-panel">
        <h2>Runtime Flexibility, Compiled Speed</h2>
        <p>Enjoy flexible runtime APIs and highly optimized compile-time code generation.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: clamp(24px, 3vw, 44px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 0 25px;
}

.hero-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
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

.hero-intro h1 {
  margin: 21px 0 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(60px, 6.6vw, 82px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.05;
}

.project-name {
  margin: 9px 0 0;
  color: var(--vp-c-text-2);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.5;
}

.tagline {
  max-width: 520px;
  margin: 22px 0 0;
  color: var(--vp-c-text-1);
  font-size: clamp(20px, 2.25vw, 26px);
  font-weight: 650;
  line-height: 1.43;
  letter-spacing: -0.018em;
}

.accent {
  color: var(--vp-c-brand-1);
}

.tagline-end {
  display: block;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 29px;
}

.actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 50px;
  padding: 12px 19px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.35;
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

.project-badges {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 7px;
  width: 100%;
  max-width: 470px;
  margin: 22px auto 0;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 7px 8px;
}

.project-badges a {
  display: inline-flex;
  line-height: 0;
}

.project-badges img {
  display: block;
  height: 20px;
  width: auto;
}

.feature-panels {
  display: flex;
  flex-direction: column;
  align-self: center;
  justify-self: center;
  width: 100%;
  max-width: 540px;
  min-width: 0;
}

.feature-panel {
  min-width: 0;
  padding: 3px 0 27px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  text-align: left;
}

.feature-panel + .feature-panel {
  padding-top: 27px;
  border-top: 1px solid var(--vp-c-divider);
}

.feature-panel:last-child {
  padding-bottom: 0;
}

.feature-panel h2 {
  margin: 0 0 10px;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.028em;
}

.feature-panel p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.feature-panel a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-divider);
  text-underline-offset: 2px;
}

.feature-panel a:hover {
  text-decoration-color: currentColor;
}

@media (max-width: 1120px) {
  .home-showcase {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 30px 0 16px;
  }

  .hero-intro h1 {
    font-size: clamp(58px, 10vw, 74px);
  }

  .feature-panels {
    max-width: 540px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .actions a {
    transition: none;
  }
}
</style>
