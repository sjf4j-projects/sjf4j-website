---
layout: home
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
---

<script setup>
import CompactHero from './.vitepress/theme/components/CompactHero.vue'
</script>

<CompactHero />

## Quick Example

Work directly with Java objects, without an intermediate JSON tree.

```java
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);

JsonPath.parse("$.address.city").put(user, "Shanghai");

String output = sjf4j.toJsonString(user);
```

[Follow the Quickstart](/docs/quickstart)

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
