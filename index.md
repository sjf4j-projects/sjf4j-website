---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import HomeShowcase from './.vitepress/theme/components/HomeShowcase.vue'
import HomeInstallation from './.vitepress/theme/components/HomeInstallation.vue'
import HomeCapabilities from './.vitepress/theme/components/HomeCapabilities.vue'
import HomeCodePanel from './.vitepress/theme/components/HomeCodePanel.vue'

const compiledNavigatorCode = `@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}`

const compiledUsageCode = `UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);`
</script>

<HomeShowcase />

## Installation

SJF4J requires **Java 8+** and supports modular installation. <span class="maven-release-inline">The latest version is: <a href="https://central.sonatype.com/search?q=sjf4j"><img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central" /></a></span>

<HomeInstallation />

<a class="home-learn-more" href="/docs/installation">Learn more → Installation</a>

## Explore Features {#explore-features}

SJF4J applies JSON semantics directly to Java objects—POJOs, Maps, Lists, and custom types—without intermediate JSON trees. 

> Binding · Navigating · Validating · Object Mapping · JDBC Result Mapping · Patching · Modeling

Choose flexible **Runtime APIs** for dynamic operations or optimized **Compiled APIs** generated at build time.

<HomeCapabilities />

## Enjoy Compiled APIs

Compile-time annotation processing generates readable Java implementations that the JVM can optimize like handwritten code. Declare an interface:

<div class="home-compiled-example">
  <HomeCodePanel title="Compiled Navigator" :code="compiledNavigatorCode" />
</div>

SJF4J generates `UserNavigator_Impl` during compilation. Invoke it through `CompiledInstances`:

<div class="home-compiled-example">
  <HomeCodePanel title="Using Compiled APIs" :code="compiledUsageCode" />
</div>

<a class="home-learn-more" href="/docs/compiled">Learn more → Compiled APIs</a>

## Benchmarks

Explore independent comparisons and reproducible JMH benchmarks for JSON Binding, JSONPath, JSON Schema, Object Mapping and JDBC Result Mapping.

- [Benchmark overview](/docs/benchmarks) — comparison summaries and full reports.
- [Java JSON Benchmark ↗](https://github.com/fabienrenaud/java-json-benchmark) — independent JSON library comparison.
- [Bowtie ↗](https://bowtie.report/) — JSON Schema compliance.

<a class="home-learn-more" href="/docs/benchmarks">Learn more → Benchmarks</a>

## Contributing

SJF4J is open source. Contributions, issues, and feedback are welcome through [GitHub](https://github.com/sjf4j-projects/sjf4j).
