---
layout: doc
title: SJF4J (Simple JSON Facade for Java)
description: A unified structural processing layer built on JSON semantics.
sidebar: false
aside: false
editLink: false
lastUpdated: false
---

# SJF4J (Simple JSON Facade for Java)

**A unified structural processing layer built on JSON semantics**

SJF4J brings binding, navigation, validation, mapping, and patching together through consistent JSON-oriented APIs for Java.

- **Native Java objects:** Work directly with POJOs, Maps, and Lists, without an intermediate JSON tree.
- **Multiple backends:** Use Jackson 2/3, Gson, Fastjson2, JSON-P, and YAML through a unified API.
- **Runtime and compiled APIs:** Choose flexible runtime operations or compile-time generated implementations.

[Getting Started](/docs/getting_started) · [Installation](/docs/installation) · [GitHub](https://github.com/sjf4j-projects/sjf4j)

## Quick Example

```java
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);

JsonPath.parse("$.address.city").put(user, "Shanghai");

String output = sjf4j.toJsonString(user);
```

[Follow the Quickstart](/docs/quickstart)

## APIs

| Feature | Runtime | Compile-time |
| --- | --- | --- |
| [Modeling](/docs/modeling) | `Nodes` | — |
| [Binding](/docs/binding) | `Sjf4j.from/toXxx()` | `@CompiledBinder` |
| [Navigating](/docs/navigating) | `JsonPath` | `@CompiledNavigator` |
| [Validating](/docs/validating) | `JsonSchema` | `@CompiledValidator` |
| [Object Mapping](/docs/mapping) | `Sjf4j.convert()` | `@CompiledMapper` |
| [JDBC Result Mapping](/docs/jdbc-mapping) | — | `@CompiledJdbcMapper` |
| [Patching](/docs/patching) | `JsonPatch` | — |

## Compile-time Code Generation

Annotate an interface; the annotation processor generates a Java implementation at build time.

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
