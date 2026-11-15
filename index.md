---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import HomeShowcase from './.vitepress/theme/components/HomeShowcase.vue'
import HomeQuickstart from './.vitepress/theme/components/HomeQuickstart.vue'
</script>

<HomeShowcase />

## Installation

SJF4J supports Java 8+. Start with the all-in-one dependency (Gradle Kotlin DSL):

```kotlin
implementation("org.sjf4j:sjf4j:{version}")
```

For a smaller dependency footprint, choose the core, backend, schema, and annotation-processor modules separately. [Installation guide](/docs/installation).

## Quickstart

<HomeQuickstart />

[Full Quickstart: model, parsing, navigation and serialization](/docs/quickstart)

## Capabilities

Runtime and compile-time APIs share the same JSON-semantic structural model.

| Feature | Capability | Runtime | Compile-time |
| --- | --- | --- | --- |
| [Modeling](/docs/modeling) | Structural operations | `Nodes` | — |
| [Binding](/docs/binding) | Data binding | `Sjf4j.from/toXxx()` | `@CompiledBinder` |
| [Navigating](/docs/navigating) | JSONPath navigation | `JsonPath` | `@CompiledNavigator` |
| [Validating](/docs/validating) | JSON Schema validation | `JsonSchema` | `@CompiledValidator` |
| [Mapping](/docs/mapping) | Object mapping | `Sjf4j.convert()` | `@CompiledMapper` |
| [JDBC Result Mapping](/docs/jdbc-mapping) | JDBC result mapping | — | `@CompiledJdbcMapper` |
| [Patching](/docs/patching) | JSON Patch & Merge Patch | `JsonPatch` | — |

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
