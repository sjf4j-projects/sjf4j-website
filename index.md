---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import HomeShowcase from './.vitepress/theme/components/HomeShowcase.vue'
</script>

<HomeShowcase />

## Explore APIs

| Feature | Runtime | Compile-time |
| --- | --- | --- |
| [Modeling](/docs/modeling) | `Nodes` | — |
| [Binding](/docs/binding) | `Sjf4j.from/toXxx()` | `@CompiledBinder` |
| [Navigating](/docs/navigating) | `JsonPath` | `@CompiledNavigator` |
| [Validating](/docs/validating) | `JsonSchema` | `@CompiledValidator` |
| [Object Mapping](/docs/mapping) | `Sjf4j.convert()` | `@CompiledMapper` |
| [JDBC Result Mapping](/docs/jdbc-mapping) | — | `@CompiledJdbcMapper` |
| [Patching](/docs/patching) | `JsonPatch` | — |

## Enjoy Compiled APIs

Compile-time annotation processing generates readable Java implementations for supported operations.

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

[How Compiled APIs Work](/docs/compiled)

## Benchmarks

Compare SJF4J with native JSON libraries, Jayway JsonPath, NetworkNT, MapStruct, Spring JDBC, and MyBatis. Detailed measurements are maintained in the main repository.

[Benchmark Overview](/docs/benchmarks)

## Installation

```kotlin
implementation("org.sjf4j:sjf4j:{version}")
```

[Module selection and annotation processor setup](/docs/installation)
