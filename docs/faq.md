---
title: "FAQ"
description: "Practical answers about SJF4J, Java object modeling, backends, compiled APIs, standards, and performance."
---

# FAQ

Common questions about SJF4J. For detailed APIs and configuration, follow the links to the feature guides.

## Getting Started

### What does SJF4J add to Jackson, Gson, or Fastjson2?

SJF4J is a **structural processing layer built on JSON semantics**, not another parser competing to replace existing libraries. It uses supported parsers as backends and adds a unified way to bind, navigate, patch, validate, and map structured data—including ordinary Java objects.

If you only need basic JSON serialization, a native library may be enough. SJF4J becomes useful when you need several of these operations under one programming model.

### Which Java version and dependencies do I need?

SJF4J supports **Java 8+**. The modules are deliberately separate:

- `sjf4j-core` — core structural APIs and runtime operations
- `sjf4j-backend-*` — optional adapters for your chosen data backend
- `sjf4j-schema` — JSON Schema validation
- `sjf4j-processor` — annotation processor for compiled APIs

Add the underlying parser dependency for the backend you select. The processor is needed at **compile time**, not as a general runtime dependency.

See [Installation](/docs/installation).

### Which formats and backends are supported?

For JSON, SJF4J supports **Jackson 2.x, Jackson 3.x, Gson, Fastjson2, JSON-P**, and a built-in Simple implementation. It also supports **YAML** via SnakeYAML, **Java Properties**, and direct operations on in-memory Java object graphs.

You can use automatic backend selection or configure a provider explicitly. The built-in JSON implementation is a fallback, not a performance substitute for dedicated parsers. YAML requires SnakeYAML.

See [Backends & Formats](/docs/backends).

## Working with Java Objects

### What is OBNT? Does SJF4J create a separate JSON tree?

**OBNT (Object-Based Node Tree)** treats supported Java values as structural nodes:

| Node kind | Examples |
| --- | --- |
| Object | `Map`, POJO, `JsonObject`, JOJO |
| Array | `List`, Java array, `JsonArray`, JAJO |
| Value | Strings, numbers, booleans, supported custom values |

SJF4J can operate on these structures directly. You do **not** need to convert every POJO or Map into a library-specific JSON AST first.

See [Modeling (OBNT)](/docs/modeling).

### When should I use a POJO, JOJO, or JAJO?

Use an ordinary **POJO** for a stable, typed object model. Use a **JOJO** (a Java object extending `JsonObject`) when typed properties and unknown or dynamic JSON members need to coexist. A **JAJO** provides an extensible array-oriented model through `JsonArray`.

You do not need to change existing domain classes to use SJF4J. JOJO and JAJO are optional modeling choices, not prerequisites.

See [Modeling (OBNT)](/docs/modeling).

### Can I query, modify, or validate objects that never came from JSON?

Yes. JSONPath navigation, JSON Pointer access, JSON Patch, and JSON Schema validation can work directly on supported Java object graphs—including existing POJOs, Maps, and Lists—without a serialize/parse round trip.

Mutation still depends on the target structure: for example, an immutable object cannot be updated as though it were a mutable Map.

See [Navigating](/docs/navigating), [Patching](/docs/patching), and [Validating](/docs/validating).

### How are unknown fields, polymorphic types, and custom values handled?

Raw object nodes can retain arbitrary members; **JOJOs** combine that flexibility with declared Java properties. For polymorphic binding, `@OneOf` supports discriminator-based subtype selection. Custom scalar representations can be modeled through `@NodeValue` and `ValueCodec`.

SJF4J also offers `ExternalNode` integration for supported third-party node models and streaming extension points for custom formats.

See [Modeling (OBNT)](/docs/modeling) and [Binding](/docs/binding).

## Runtime and Compiled APIs

### When should I use Runtime APIs versus Compiled APIs?

Use **Runtime APIs** when paths, schemas, target types, or transformations are selected dynamically. Use **Compiled APIs** for stable, frequently executed operations where generating specialized Java code is valuable.

Compiled APIs reduce interpretation and generic dispatch overhead, but are not automatically faster in every workload. They also have feature-specific constraints, so runtime APIs remain important.

See [Compiled APIs](/docs/compiled) and [Benchmarks](/docs/benchmarks).

### What can SJF4J generate at compile time?

| Annotation | Generated capability |
| --- | --- |
| `@CompiledBinder` | Data binding with specialized readers and writers |
| `@CompiledNavigator` | JSONPath access, querying, and updates |
| `@CompiledValidator` | JSON Schema validation for statically bound schemas |
| `@CompiledMapper` | Java object-to-object mapping |
| `@CompiledJdbcMapper` | JDBC `ResultSet` mapping |

These are ordinary generated Java implementations, not a separate runtime or bytecode interpreter.

See [Compiled APIs](/docs/compiled).

### How do I use and inspect generated implementations?

Add `sjf4j-processor` to your Gradle or Maven annotation-processing configuration, declare an annotated interface, and instantiate it with `CompiledInstances.create(...)`.

Generated implementations use the `_Impl` suffix. Their source files appear in the usual annotation-processing output directory—for example, `build/generated/sources/annotationProcessor/java/main` in Gradle or `target/generated-sources/annotations` in Maven—so you can read and debug them.

See [Installation](/docs/installation) and [Compiled APIs](/docs/compiled).

### What if an operation cannot be compiled?

Support depends on the annotation and operation. The processor can reject unsupported cases at compile time; some APIs allow **explicit runtime fallback** where configured. Do not assume that every dynamic JSONPath expression, mapper conversion, or schema keyword can be fully compiled.

Choose Runtime APIs for operations that must remain dynamic, and consult the feature-specific limitations when introducing compiled code.

See [Compiled APIs](/docs/compiled).

### Can SJF4J map JDBC results without an ORM?

Yes. `@CompiledJdbcMapper` generates direct mappings from JDBC `ResultSet` rows to Java objects, including single-object and list-oriented mapping. It also supports reusable, stateless `JdbcRowMapper<T>` instances and configurable column-name matching.

This is **result mapping**, not an ORM or SQL execution framework. You retain control of connections, queries, and transactions.

See [JDBC Result Mapping](/docs/jdbc-mapping).

## Standards, Performance, and Compatibility

### Which JSON standards does SJF4J support?

SJF4J implements JSON-oriented operations based on:

- **JSONPath** — RFC 9535, for queries
- **JSON Pointer** — RFC 6901, for addressing nodes
- **JSON Patch** — RFC 6902, for ordered changes
- **JSON Merge Patch** — RFC 7386, for object-based changes
- **JSON Schema** — Draft 2020-12, 2019-09, and 7

SJF4J also provides **Indexed Merge Patch**, a non-standard extension for index-based array updates. Standard behavior and SJF4J-specific mutation extensions are distinct.

See [Navigating](/docs/navigating), [Patching](/docs/patching), and [Validating](/docs/validating).

### Can JSON Schema validate a POJO directly?

Yes. The `sjf4j-schema` module validates supported Java object graphs through OBNT, without requiring a JSON serialization round trip. Runtime validation supports **Draft 2020-12, 2019-09, and 7**; `@CompiledValidator` specializes statically known schemas, subject to compile-time coverage and fallback rules.

See [Validating](/docs/validating).

### How fast is SJF4J compared with native parsers and other frameworks?

It depends on the **backend, data model, operation, and workload**. Runtime APIs add generality; compiled APIs can remove much of that overhead. Some compiled workloads outperform the corresponding direct backend or framework; others are close to parity or slower.

The [Benchmarks](/docs/benchmarks) page separates project-run JMH measurements from independent comparisons, and links to workloads, raw results, and test configurations. Compare like-for-like operations rather than assuming a single universal speedup.

### Does SJF4J support GraalVM Native Image?

Compiled binding has been benchmarked in **GraalVM Native Image** as well as on the JVM. Native Image compatibility and performance still depend on your selected backend, reachable code, and build-time configuration.

See [GraalVM Native Image benchmarks](/docs/benchmarks#binding-on-graalvm-native-image).

### What changed in recent releases, and where can I ask questions?

The 1.5.x line introduced modular artifacts and expanded compile-time support. If upgrading older code, check renamed APIs such as `@CompiledPath` → `@CompiledNavigator` and `CompiledNodes` → `CompiledInstances`. Version 1.5.1 also changed mapper converter configuration and JDBC row-mapper signatures.

See the [Changelog](https://github.com/sjf4j-projects/sjf4j/blob/main/CHANGELOG.md), or [open an issue](https://github.com/sjf4j-projects/sjf4j/issues) for questions, bugs, or proposals.
