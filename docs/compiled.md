---
title: "Enjoy Compiled APIs"
description: "Understand SJF4J compile-time code generation and usage."
---

# Enjoy Compiled APIs

Compiled APIs use Java annotation processing to generate readable, debuggable implementations for supported binding, navigation, validation, mapping, and JDBC operations.

## Why Compiled APIs?

Generated code can reduce runtime interpretation, reflection, and generic dispatch overhead. Actual benefits vary by workload; see [Benchmarks](/docs/benchmarks).

## 1. Annotated Interface

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

## 2. Generated Java Source

The annotation processor generates an implementation such as `UserNavigator_Impl`. Generated Java is visible in your build's annotation-processing source directory.

## 3. Instantiate and Use

```java
UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);
```

## Supported APIs

| API | Purpose |
| --- | --- |
| `@CompiledBinder` | Data binding |
| `@CompiledNavigator` | JSONPath navigation |
| `@CompiledValidator` | JSON Schema validation |
| `@CompiledMapper` | Object mapping |
| `@CompiledJdbcMapper` | JDBC result mapping |

## Configuration

See [Installation](/docs/installation) for the annotation processor dependency. Expanded configuration and instance-creation options will be documented here.

## Limitations and Fallback

Not all dynamic operations can be statically compiled. Feature-specific pages will describe limitations and any explicit fallback options.
