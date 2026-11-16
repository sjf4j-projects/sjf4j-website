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
    UserNavigator INSTANCE = CompiledInstances.create(UserNavigator.class);

    @GetByPath("$.address.city")
    String getCity(User user);
}`

const compiledGeneratedCode = `// Simplified illustration of generated code
public final class UserNavigator_Impl implements UserNavigator {
    @Override
    public String getCity(User user) {
        if (user == null) return null;
        Address address = user.address;
        return address == null ? null : address.city;
    }
}`

const compiledGradlePath = `build/
└── generated/sources/annotationProcessor/
    └── java/main/com/example/
        └── UserNavigator_Impl.java`

const compiledMavenPath = `target/
└── generated-sources/annotations/
    └── com/example/
        └── UserNavigator_Impl.java`

const compiledUsageCode = `// More commonly, just use the static INSTANCE
String city = UserNavigator.INSTANCE.getCity(user);`
</script>

<HomeShowcase />

## Installation

SJF4J requires **Java 8+** and supports modular installation. <span class="maven-release-inline">The latest version is: <a href="https://central.sonatype.com/search?q=sjf4j"><img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central" /></a></span>

<HomeInstallation />

<a class="home-learn-more" href="/docs/installation">Learn more → Installation</a>


## Explore Features {#explore-features}

SJF4J applies JSON semantics directly to Java objects — POJOs, Maps, Lists, and custom types — without intermediate JSON trees.  
Use flexible **Runtime APIs** for dynamic operations or optimized **Compiled APIs** generated at build time. Explore the capabilities below:

<HomeCapabilities />

## Enjoy Compiled APIs

SJF4J's annotation processor turns annotated interfaces into readable, debuggable Java implementations that the JVM can optimize like handwritten code. Define an interface and see the code generated at compile time:

<div class="home-compiled-example">
  <HomeCodePanel title="Define Interface" :code="compiledNavigatorCode" />
  <HomeCodePanel title="Generated Code" :code="compiledGeneratedCode" />
</div>

Generated classes use the `_Impl` suffix. Their Java sources are written to the standard annotation-processing output directory for each build tool:

<div class="home-compiled-paths">
  <HomeCodePanel title="Gradle" language="Text" :code="compiledGradlePath" />
  <HomeCodePanel title="Maven" language="Text" :code="compiledMavenPath" />
</div>

Enable the processor with `annotationProcessor("org.sjf4j:sjf4j-processor:{version}")` in Gradle. 
Then use it:

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
