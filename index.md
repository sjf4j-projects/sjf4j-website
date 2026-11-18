---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import HomeShowcase from './.vitepress/theme/components/HomeShowcase.vue'
import HomeCapabilities from './.vitepress/theme/components/HomeCapabilities.vue'
import HomeSpring from './.vitepress/theme/components/HomeSpring.vue'
</script>

<HomeShowcase />

## Explore Features {#explore-features}

<p class="home-explore-lead">Work directly with Java objects using flexible <strong>Runtime APIs</strong> and optimized <strong>Compiled APIs</strong>.</p>

<HomeCapabilities />

<section class="home-section home-performance-section" aria-labelledby="performance-at-a-glance">
  <h2 id="performance-at-a-glance">Performance at a Glance</h2>
  <BenchmarkHighlights />
  <p class="home-benchmark-more"><a href="/docs/benchmarks">Explore Benchmarks</a></p>
</section>

<section class="home-section home-spring-section" aria-labelledby="use-sjf4j-with-spring-boot">
  <h2 id="use-sjf4j-with-spring-boot">Use SJF4J with Spring Boot</h2>
  <p class="home-spring-lead">Use compiled SJF4J APIs as Spring-managed beans — no manual instantiation or component annotations required.</p>
  <HomeSpring />
</section>
