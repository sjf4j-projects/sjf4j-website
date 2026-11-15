---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import HomeShowcase from './.vitepress/theme/components/HomeShowcase.vue'
import HomeInstallation from './.vitepress/theme/components/HomeInstallation.vue'
import HomeCapabilities from './.vitepress/theme/components/HomeCapabilities.vue'
</script>

<HomeShowcase />

## Installation

Add the all-in-one dependency for Java 8+ (replace `{version}` with the current release).

<HomeInstallation />

For finer dependency control, select individual modules and configure the annotation processor in the [Installation guide](/docs/installation).

## Capabilities

Runtime and compile-time APIs operate on the same JSON-semantic structural model. Compare the core APIs side by side:

<HomeCapabilities />

## Enjoy Compiled APIs

Compile-time annotation processing generates readable Java implementations that the JVM can optimize like handwritten code. Declare an interface:

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

SJF4J generates `UserNavigator_Impl` during compilation. Invoke it through `CompiledInstances`:

```java
UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);
```

[How compiled APIs work](/docs/compiled)

## Benchmarks

Explore independent comparisons and reproducible JMH benchmarks for JSON Binding, JSONPath, JSON Schema, Object Mapping and JDBC Result Mapping.

- [Benchmark overview](/docs/benchmarks) — comparison summaries and full reports.
- [Java JSON Benchmark ↗](https://github.com/fabienrenaud/java-json-benchmark) — independent JSON library comparison.
- [Bowtie ↗](https://bowtie.report/) — JSON Schema compliance.

## Contributing

SJF4J is open source. Contributions, issues, and feedback are welcome through [GitHub](https://github.com/sjf4j-projects/sjf4j).
