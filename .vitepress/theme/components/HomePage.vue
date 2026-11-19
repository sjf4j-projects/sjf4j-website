<script setup lang="ts">
import { useData } from 'vitepress'
import { useSiteMessages } from '../i18n'
import { localizedLink } from '../../i18n/routes'
import HomeShowcase from './HomeShowcase.vue'
import HomeCapabilities from './HomeCapabilities.vue'
import BenchmarkHighlights from './BenchmarkHighlights.vue'
import HomeSpring from './HomeSpring.vue'

const { lang } = useData()
const t = useSiteMessages()
</script>

<template>
  <HomeShowcase />

  <h2 id="explore-features">{{ t.home.sections.exploreTitle }}</h2>
  <p class="home-explore-lead">
    {{ t.home.sections.leadBefore }}<strong>{{ t.home.sections.runtimeLabel }}</strong>{{ t.home.sections.leadBetween }}<strong>{{ t.home.sections.compiledLabel }}</strong>{{ t.home.sections.leadAfter }}
  </p>
  <HomeCapabilities />

  <section class="home-section home-performance-section" aria-labelledby="performance-at-a-glance">
    <h2 id="performance-at-a-glance">{{ t.home.sections.performanceTitle }}</h2>
    <BenchmarkHighlights />
    <p class="home-benchmark-more">
      <a :href="localizedLink('/docs/benchmarks', lang)">{{ t.home.sections.benchmarkLink }}</a>
    </p>
  </section>

  <section class="home-section home-spring-section" aria-labelledby="use-sjf4j-with-spring-boot">
    <h2 id="use-sjf4j-with-spring-boot">{{ t.home.sections.springTitle }}</h2>
    <p class="home-spring-lead">{{ t.home.sections.springDescription }}</p>
    <HomeSpring />
  </section>
</template>
