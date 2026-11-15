---
layout: home

hero:
  name: SJF4J
  text: Simple JSON Facade for Java
  tagline: A unified structural processing layer built on JSON semantics.
  actions:
    - theme: brand
      text: Get Started
      link: /docs/quickstart
    - theme: alt
      text: Documentation
      link: /docs/getting_started
    - theme: alt
      text: GitHub
      link: https://github.com/sjf4j-projects/sjf4j

features:
  - icon: "◇"
    title: JSON Semantics, Native Java Objects
    details: Apply JSON-oriented operations directly to POJOs, Maps, Lists, and other Java objects.
  - icon: "▣"
    title: Multiple Backends, One API
    details: Work across Jackson, Gson, Fastjson2, JSON-P, YAML and other data formats.
  - icon: "⚡"
    title: Runtime Flexibility, Compiled Speed
    details: Combine expressive runtime APIs with compile-time generated Java implementations.
---

## Quick Example

Work with ordinary Java objects. No intermediate JSON tree is required.

```java
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);

JsonPath.parse("$.address.city").put(user, "Shanghai");

String result = sjf4j.toJsonString(user);
```

[Follow the Quickstart](/docs/quickstart)

## Explore Features

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

Compile-time annotation processing generates readable Java implementations for supported operations. See the annotated interface alongside a simplified generated implementation in the [Compiled APIs guide](/docs/compiled).

## Benchmarks & Compliance

Explore comparisons for binding, JSONPath, JSON Schema, object mapping, and JDBC result mapping. Full results are maintained in the main repository.

[Explore Benchmarks](/docs/benchmarks)

## Installation

Start with the all-in-one artifact, or choose individual modules and backends.

```kotlin
implementation("org.sjf4j:sjf4j:{version}")
```

[Installation details](/docs/installation)
