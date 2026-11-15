<template>
  <section class="technical-hero" aria-labelledby="site-heading">
    <div class="hero-intro">
      <h1 id="site-heading">
        SJF4J
        <span>(Simple JSON Facade for Java)</span>
      </h1>
      <p class="hero-tagline">
        A unified structural processing layer built on JSON semantics
      </p>
      <div class="hero-actions">
        <a class="primary-action" href="/docs/quickstart">Get Started <span aria-hidden="true">→</span></a>
        <a class="plain-action" href="/docs/getting_started">Documentation</a>
        <a class="plain-action" href="https://github.com/sjf4j-projects/sjf4j" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </div>
    </div>

    <div class="hero-features" aria-label="Key capabilities">
      <div class="feature">
        <h2>JSON Semantics, Native Java Objects</h2>
        <p>Work directly with POJOs, Maps and Lists — no intermediate JSON tree.</p>
      </div>
      <div class="feature">
        <h2>Multiple Backends, One API</h2>
        <p>Use Jackson 2/3, Gson, Fastjson2, JSON-P and YAML through one facade.</p>
      </div>
      <div class="feature">
        <h2>Runtime Flexibility, Compiled Speed</h2>
        <p>Choose dynamic runtime APIs or optimized compile-time generated code.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.technical-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 4.5vw, 64px);
  min-height: 340px;
  padding: 44px 0;
}

.hero-intro {
  min-width: 0;
}

.hero-intro h1 {
  margin: 0;
  padding: 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: clamp(36px, 3.4vw, 46px);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.hero-intro h1 span {
  display: block;
  margin-top: 7px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
}

.hero-tagline {
  margin: 20px 0 0;
  max-width: 460px;
  color: var(--vp-c-text-1);
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.5;
  font-weight: 600;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 25px;
}

.hero-actions a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.primary-action {
  padding: 10px 15px;
  border-radius: 7px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.primary-action:hover {
  background: var(--vp-c-brand-2);
  color: var(--vp-c-white);
}

.plain-action {
  color: var(--vp-c-text-2);
}

.plain-action:hover {
  color: var(--vp-c-brand-1);
}

.hero-features {
  display: grid;
  gap: 11px;
  min-width: 0;
}

.feature {
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.feature h2 {
  margin: 0;
  padding: 0;
  border: none;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.4;
  font-weight: 650;
}

.feature p {
  margin: 5px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .technical-hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
    min-height: 0;
    padding: 34px 0 24px;
  }

  .hero-features {
    gap: 9px;
  }

  .feature {
    padding: 14px 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-actions a {
    transition: none;
  }
}
</style>
