---
title: "Compiled APIs"
description: "Generate specialized Java implementations at compile time for binding, navigation, validation, object mapping, and JDBC results."
---

# Compiled APIs

**Runtime Flexibility, Compiled Speed.** SJF4J can turn annotated Java interfaces into specialized implementations during compilation. The result is ordinary, readable Java source code that can be inspected, debugged, and optimized by the JVM.

Compiled APIs complement SJF4J's flexible runtime APIs. They are designed for stable operations where type information and expressions are known ahead of time.

## How It Works

Define an interface that describes what you want to do. SJF4J's annotation processor analyzes the interface and generates its implementation at build time.

<CompiledCodeComparison />

*The generated implementation above is a simplified illustration, not verbatim processor output.* In this example, `User` has an `Address address` property, and `Address` has a `String city` property.

Use the interface as you would any other Java API:

```java
UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);
```

The generated class is named `UserNavigator_Impl`. Its compiled methods can replace repeated path interpretation and generic dispatch with direct Java access where the model permits. Some operations still call SJF4J runtime support where necessary.

The process is straightforward: **declare an interface → compile the generated Java → call the implementation**. There is no separate bytecode interpreter or required intermediate JSON tree.

## Available Compiled APIs

The same compile-time programming model covers five capabilities:

| Annotation | Generated capability | Guide |
| --- | --- | --- |
| `@CompiledBinder` | Specialized reads and writes for selected formats and backends | [Binding](/docs/binding) |
| `@CompiledNavigator` | JSONPath access, querying, and updates | [Navigating](/docs/navigating) |
| `@CompiledValidator` | Validation of statically bound JSON Schemas | [Validating](/docs/validating) |
| `@CompiledMapper` | Java object-to-object mapping and updates | [Object Mapping](/docs/mapping) |
| `@CompiledJdbcMapper` | Direct JDBC `ResultSet`-to-object mapping | [JDBC Mapping](/docs/jdbc-mapping) |

Each annotation generates a dedicated `_Impl` class for its interface, but the supported method signatures and compilation rules differ by capability.

In particular, `@CompiledJdbcMapper` maps database columns directly rather than transforming a Java object graph. It can also prepare reusable, stateless `JdbcRowMapper<T>` instances from `ResultSetMetaData`. See the feature guides for the operation-specific APIs and examples.

## Getting Started

### Enable annotation processing

SJF4J supports **Java 8+**. Add `sjf4j-processor` to the **annotation processor path**; it is not a normal application runtime dependency. Replace `{version}` with the current [Maven Central release](https://central.sonatype.com/artifact/org.sjf4j/sjf4j).

::: code-group

```kotlin [Gradle (Kotlin DSL)]
dependencies {
    implementation("org.sjf4j:sjf4j-core:{version}")
    annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
}
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j-core</artifactId>
    <version>{version}</version>
</dependency>

<!-- Under <build><plugins> -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.sjf4j</groupId>
                <artifactId>sjf4j-processor</artifactId>
                <version>{version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

:::

These are the minimum dependencies for the navigation example. Add a suitable backend and its library for compiled binding, or `sjf4j-schema` for compiled validation.

For complete dependency and Maven configuration examples, see [Installation](/docs/installation).

### Create and reuse instances

`CompiledInstances.create(...)` constructs a **new instance** of the generated implementation each time; it does not cache one for you. Applications may retain an instance, manage it through dependency injection, or declare a shared field on the interface:

```java
@CompiledNavigator
interface UserNavigator {
    UserNavigator INSTANCE = CompiledInstances.create(UserNavigator.class);

    @GetByPath("$.address.city")
    String getCity(User user);
}

String city = UserNavigator.INSTANCE.getCity(user);
```

The factory also supports supplying a `RuntimeContext`; compiled binders may accept a preconfigured matching backend binder. See the corresponding feature guide for configuration details.

### Inspect generated source

Generated Java uses the interface name with an `_Impl` suffix and appears in the normal annotation-processing output directory:

| Build tool | Typical generated source directory |
| --- | --- |
| Gradle | `build/generated/sources/annotationProcessor/java/main/` |
| Maven | `target/generated-sources/annotations/` |

Open the generated `UserNavigator_Impl.java` to inspect the actual code. It is regular Java source, so you can debug it with ordinary IDE tooling.

## Runtime vs. Compiled

Choose the API style based on how much of the operation is known before execution:

| | Runtime APIs | Compiled APIs |
| --- | --- | --- |
| Definition | Selected and configured at runtime | Declared in annotated interfaces |
| Expressions and types | Can be dynamic | Must satisfy static compilation rules |
| Execution | General-purpose structural processing | Specialized generated Java |
| Setup | No annotation processor | Annotation processing during the build |
| Best suited for | Dynamic or ad hoc operations | Stable, frequently executed operations |

Both operate on SJF4J's [Object-Based Node Tree (OBNT)](/docs/modeling), so adopting compiled APIs does not require adopting a separate Java object model.

### Compilation limits and fallback

**Not every runtime feature can be generated as direct Java code.** Unsupported operations may produce compiler diagnostics rather than silently changing behavior.

Fallback is **capability-specific**, not a universal switch. For example:

- `@CompiledNavigator(fallback = true)` permits runtime evaluation for certain `@FindByPath` filters.
- `@CompiledValidator(fallback = true)` can delegate unsupported schema checks to the runtime `SchemaPlan`; its default is `false`, which rejects unsupported constructs during compilation.

These options do not mean every dynamic expression or conversion can be compiled or automatically delegated. Consult the relevant feature guide when deciding between runtime execution and generated code.

## Performance

Generated implementations can reduce repeated parsing, interpretation, reflection, and generic dispatch, but **there is no universal speedup**. Results depend on the backend, Java model, data size, and operation.

The [Benchmarks](/docs/benchmarks) overview links to project-run JMH results and independent comparisons. For details, see [Binding](/docs/performance/binding), [Native Image Binding](/docs/performance/binding-native), [JSONPath Navigation](/docs/performance/path), [JSON Schema Validation](/docs/performance/schema), [Object Mapping](/docs/performance/mapping), and [JDBC Result Mapping](/docs/performance/jdbc-mapping).

Use those workload-specific measurements to decide where compilation provides a worthwhile benefit.
