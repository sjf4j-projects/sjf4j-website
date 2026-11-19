---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: 基于 JSON 语义的统一结构化数据处理层。
---

<script setup>
import HomeShowcase from '../.vitepress/theme/components/HomeShowcase.vue'
import HomeCapabilities from '../.vitepress/theme/components/HomeCapabilities.vue'
import HomeSpring from '../.vitepress/theme/components/HomeSpring.vue'
</script>

<HomeShowcase />

## 探索功能 {#explore-features}

<p class="home-explore-lead">通过灵活的 <strong>运行时 API</strong> 和高性能的 <strong>编译式 API</strong>，直接操作 Java 对象。</p>

<HomeCapabilities />

<section class="home-section home-performance-section" aria-labelledby="performance-at-a-glance">
  <h2 id="performance-at-a-glance">性能一览</h2>
  <BenchmarkHighlights />
  <p class="home-benchmark-more"><a href="/docs/benchmarks">查看性能测试</a></p>
</section>

<section class="home-section home-spring-section" aria-labelledby="use-sjf4j-with-spring-boot">
  <h2 id="use-sjf4j-with-spring-boot">在 Spring 中使用 SJF4J</h2>
  <p class="home-spring-lead">将编译式 SJF4J API 直接注入 Spring Bean，无需手动创建实例或添加组件注解。</p>
  <HomeSpring />
</section>
