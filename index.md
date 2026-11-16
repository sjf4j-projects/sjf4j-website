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

const compiledUsageCode = `String city = UserNavigator.INSTANCE.getCity(user);`
</script>

<HomeShowcase />

## Installation

SJF4J requires **Java 8+** and supports modular installation. <span class="maven-release-inline">Latest release: <a href="https://central.sonatype.com/search?q=sjf4j"><img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central" /></a></span>

<HomeInstallation />

<a class="home-learn-more" href="/docs/installation">Learn more → Installation</a>


## Explore Features {#explore-features}

SJF4J applies JSON semantics directly to POJOs, Maps, Lists, and custom Java types — without building intermediate JSON trees. Use flexible **Runtime APIs** for dynamic operations or **Compiled APIs** for optimized code generated at compile time. Select a feature to explore its APIs.

<HomeCapabilities />

## Enjoy Compiled APIs

SJF4J's annotation processor generates readable, debuggable Java source from annotated interfaces. The JVM can optimize the resulting implementations just like handwritten code:

<div class="home-compiled-example">
  <HomeCodePanel title="Define an Interface" :code="compiledNavigatorCode" />
  <HomeCodePanel title="Generated Code" :code="compiledGeneratedCode" />
</div>

Generated implementation classes use the `_Impl` suffix. Their source files are written to each build tool's annotation-processing output directory:

<div class="home-compiled-paths">
  <HomeCodePanel title="Gradle" language="Text" :code="compiledGradlePath" />
  <HomeCodePanel title="Maven" language="Text" :code="compiledMavenPath" />
</div>

Configure the annotation processor with `annotationProcessor("org.sjf4j:sjf4j-processor:{version}")` in Gradle (or use the Maven configuration in [Installation](/docs/installation)). Instantiate the generated implementation with `CompiledInstances.create()`, typically through a static `INSTANCE` field on the interface:

<div class="home-compiled-example">
  <HomeCodePanel title="Use the Generated API" :code="compiledUsageCode" />
</div>

<a class="home-learn-more" href="/docs/compiled">Learn more → Compiled APIs</a>

## Benchmarks

SJF4J's performance and standards compliance are evaluated through independent comparisons and [JMH](https://github.com/openjdk/jmh) benchmarks.

**JSON Binding**
- [Java JSON Benchmark ↗](https://github.com/fabienrenaud/java-json-benchmark) — Independent JSON library benchmarks.
- [Binding Full Benchmarks](/docs/performance/binding) — Native JSON backends vs. Runtime and Compiled.
- [Binding Native Image Full Benchmarks](/docs/performance/binding-native) — GraalVM AOT, direct library Binding vs. Runtime and Compiled.

**JSONPath Navigation**
- [JSONPath Comparison ↗](https://cburgmer.github.io/json-path-comparison/) — Cross-implementation specification compatibility.
- [JSONPath Full Benchmarks](/docs/performance/path) — Jayway JsonPath vs. Runtime and Compiled.

**JSON Schema Validation**
- [Creek Service ↗](https://www.creekservice.org/json-schema-validation-comparison/) — Independent JVM validation benchmarks.
- [Bowtie ↗](https://bowtie.report/) — Cross-language JSON Schema compliance.
- [JSON Schema Full Benchmarks](/docs/performance/schema) — NetworkNT vs. Runtime and Compiled, including roundtrip performance.

**Object Mapping**
- [Java Object Mapper Benchmark ↗](https://github.com/arey/java-object-mapper-benchmark) — Independent comparison with Java mapping frameworks.
- [Object Mapping Full Benchmarks](/docs/performance/mapping) — MapStruct vs. CompiledMapper.

**JDBC Result Mapping**
- [JDBC Mapping Full Benchmarks](/docs/performance/jdbc-mapping) — Spring JDBC and MyBatis vs. CompiledJdbcMapper.


<a class="home-learn-more" href="/docs/benchmarks">Learn more → Benchmarks</a>

## Contributing

SJF4J is open source. Contributions, bug reports, and feedback are welcome on [GitHub](https://github.com/sjf4j-projects/sjf4j).
