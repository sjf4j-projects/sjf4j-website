---
title: "Backends & Formats"
description: "Connect SJF4J to JSON and YAML libraries, choose a backend, and extend its streaming API."
---

# Backends & Formats

SJF4J provides a unified API for JSON, YAML, and Java Properties while letting you choose the underlying parser and writer.

## Supported Backends

| Format | Backend | SJF4J module |
| --- | --- | --- |
| JSON | Simple (built-in) | `sjf4j-core` |
| JSON | Jackson 2.x / 3.x | `sjf4j-backend-jackson2` / `sjf4j-backend-jackson3` |
| JSON | Gson | `sjf4j-backend-gson` |
| JSON | Fastjson2 | `sjf4j-backend-fastjson2` |
| JSON | JSON-P | `sjf4j-backend-jsonp` |
| YAML | SnakeYAML | `sjf4j-backend-snake` |
| Properties | Built-in | `sjf4j-core` |

Add the SJF4J adapter **and** its native library. For example, with Jackson 2.x:

```kotlin
implementation("org.sjf4j:sjf4j-core:{version}")
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")
```

See [Installation](/docs/installation) for Maven, other backend dependencies, and supported versions.

## Backend Selection

**Runtime:** `new Sjf4j()` discovers available `BinderProvider` implementations through Java's `ServiceLoader` and uses the highest-priority provider for each format. JSON falls back to Simple; YAML requires SnakeYAML. Use `Sjf4j.builder()` to supply a custom provider when needed.

**Compiled:** `@CompiledBinder` selects a backend at compile time. `Backend.AUTO` uses the first compatible backend available on the compilation classpath, or you can select one explicitly:

```java
@CompiledBinder(backend = Backend.JACKSON2)
interface UserJson {
    @Read User read(String json);
}
```

The selected backend is fixed for the generated implementation. See [Binding](/docs/binding) and [Compiled APIs](/docs/compiled) for the full APIs.

## Custom Formats

The streaming API is extensible: implement a `BinderProvider` backed by SJF4J's reader/writer contracts, then publish it via `ServiceLoader`. Applications continue using the same structural model and binding APIs.

For integrations with a library's *existing in-memory node tree*, see [External Nodes](/docs/external-nodes).
