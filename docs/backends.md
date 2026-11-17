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

## Custom Formats and Streaming

SJF4J separates **structural binding** from the underlying parser and writer. A backend implements the `StreamingParser` and `StreamingGenerator` contracts; SJF4J handles binding to POJOs, Maps, Lists, and other supported Java types.

### Example: Jackson 2

The Jackson 2 adapter wraps Jackson's native `JsonParser` and `JsonGenerator` with `Jackson2Parser` and `Jackson2Generator`. You can configure the Jackson factory and supply it to an SJF4J runtime:

```java
JsonFactory factory = JsonFactory.builder()
        .enable(JsonReadFeature.ALLOW_JAVA_COMMENTS)
        .build();

Sjf4j sjf4j = Sjf4j.builder()
        .jsonProvider(Jackson2BinderProvider.of(factory))
        .build();

User user = sjf4j.fromJson("{ /* comment */ \"name\": \"Alice\" }", User.class);
String json = sjf4j.toJsonString(user);
```

This example allows comments in the input while keeping SJF4J's object binding and output APIs unchanged. The feature is enabled on this runtime's Jackson backend; it does not change JSON's standard syntax.

The integration follows four layers:

| Layer | Jackson 2 implementation | Responsibility |
| --- | --- | --- |
| Native streaming | `JsonParser` / `JsonGenerator` | Read and write JSON tokens |
| SJF4J streaming | `Jackson2Parser` / `Jackson2Generator` | Adapt tokens and values to SJF4J's contract |
| Binding | `Jackson2Binder` | Connect the streaming adapters to SJF4J binding |
| Discovery | `Jackson2BinderProvider` | Create binders and participate in backend selection |

### Adding a Backend

To integrate another streaming library or format:

1. Extend `StreamingParser` and `StreamingGenerator`, translating native events to SJF4J's object, array, name, and scalar operations.
2. Extend `Binder` to create those adapters for readers and writers.
3. Implement `BinderProvider` and register it via Java `ServiceLoader` (`META-INF/services/org.sjf4j.binding.BinderProvider`).

A provider identifies its format with `Format.JSON`, `Format.YAML`, or a custom identifier such as `Format.of("com.example:toml")`. Custom formats can be resolved through `BinderFactory`; the `Sjf4j` facade exposes built-in JSON, YAML, and Properties entry points.

For working directly with a library's *existing in-memory node tree*, use [External Nodes](/docs/external-nodes) instead. For a complete reference implementation, see [Jackson2Binder](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-backend-jackson2/src/main/java/org/sjf4j/backend/jackson2/binding/Jackson2Binder.java).
