---
title: "Installation"
description: "Install SJF4J with Gradle or Maven, choose modules and backends, and enable compiled APIs."
---

# Installation

SJF4J supports **Java 8+**. Individual backend libraries may require a newer Java version.

Replace every `{version}` with the current [![Maven Central version](https://img.shields.io/maven-central/v/org.sjf4j/sjf4j-core)](https://central.sonatype.com/artifact/org.sjf4j/sjf4j-core).

The guides may cover changes ahead of a published release. The [latest Javadoc](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/) describes the latest published API; for exact signatures, consult the Javadoc matching your dependency version.

## Quick Setup

Install `sjf4j-core` and add only the modules you need. These examples use **Jackson 2.x** as the JSON backend.

::: code-group

```kotlin [Gradle (Kotlin DSL)]
dependencies {
    implementation("org.sjf4j:sjf4j-core:{version}")

    // Optional: Jackson 2.x backend (includes its library)
    implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")

    // Optional: JSON Schema validation
    implementation("org.sjf4j:sjf4j-schema:{version}")

    // Optional: Compiled APIs
    annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
}
```

```xml [Maven]
<dependencies>
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-core</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: Jackson 2.x backend (includes its library) -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jackson2</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: JSON Schema validation -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-schema</artifactId>
        <version>{version}</version>
    </dependency>
</dependencies>
```

:::

`sjf4j-core` includes Simple JSON and Java Properties support, so no external backend is required for those formats. For compiled APIs with Maven, configure the [annotation processor](#compiled-apis) separately.

## Modules

![SJF4J module dependencies](/diagrams/sjf4j-module-dependencies.svg)

| Module | Purpose | Depends on |
| --- | --- | --- |
| `sjf4j-core` | Structural APIs, binding, navigation, mapping and patching | — |
| `sjf4j-schema` | JSON Schema validation | Core |
| `sjf4j-processor` | Compile-time code generation | Core, Schema |
| `sjf4j-spring` | Register compiled interfaces as Spring Beans (Java 17+) | Core, Spring Framework |
| `sjf4j-spring-boot-starter` | Spring Boot auto-configuration for compiled APIs (Java 17+) | Spring, Spring Boot |
| `sjf4j-backend-*` | JSON/YAML backend adapters | Core |
| `sjf4j` | All-in-one: Core, Schema and six adapters | All above except Processor |

**Prefer modular dependencies** to keep the classpath small. Alternatively, install the aggregate artifact:

::: code-group

```kotlin [Gradle (Kotlin DSL)]
implementation("org.sjf4j:sjf4j:{version}")
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j</artifactId>
    <version>{version}</version>
</dependency>
```

:::

The aggregate includes all six **SJF4J adapters** and their native libraries transitively, but not the annotation processor.

## Backends

The complete set of built-in and optional backends:

| Format | Backend | SJF4J module | Included third-party library |
| --- | --- | --- | --- |
| JSON | Jackson 3.x | `sjf4j-backend-jackson3` | `tools.jackson.core:jackson-databind:3.2.3` |
| JSON | Jackson 2.x | `sjf4j-backend-jackson2` | `com.fasterxml.jackson.core:jackson-databind:2.22.3` |
| JSON | Gson | `sjf4j-backend-gson` | `com.google.code.gson:gson:2.13.1` |
| JSON | Fastjson2 | `sjf4j-backend-fastjson2` | `com.alibaba.fastjson2:fastjson2:2.0.66` |
| JSON | JSON-P | `sjf4j-backend-jsonp` | `jakarta.json:jakarta.json-api:2.1.3` and provider `org.eclipse.parsson:parsson:1.1.7` |
| JSON | Simple | `sjf4j-core` | None |
| YAML | SnakeYAML | `sjf4j-backend-snake` | `org.yaml:snakeyaml:2.5` |
| Properties | Built-in | `sjf4j-core` | None |

The versions shown are those used by the SJF4J project; compatible library versions may also work. Each backend module provides its third-party library transitively. The JSON-P module also includes Parsson as its default runtime provider.

**Automatic JSON selection (highest priority first):**

**Jackson 3 → Jackson 2 → Gson → Fastjson2 → JSON-P → Simple**

SJF4J chooses the first available built-in backend in this order. Runtime binding discovers providers through `ServiceLoader`; `@CompiledBinder(backend = Backend.AUTO)` selects a backend at compile time. Both require the corresponding adapter and native library (JSON-P also requires an implementation). Simple is the built-in fallback.

YAML uses SnakeYAML when available; Java Properties support is built in. See [Backends & Formats](/docs/backends#backend-selection) for selection rules and explicit overrides.

## Compiled APIs

Add `sjf4j-processor` to the annotation processor path (not as a normal runtime dependency).

**Gradle:** use the `annotationProcessor(...)` declaration shown in [Quick Setup](#quick-setup).

**Maven:** configure the compiler plugin:

```xml
<build>
    <plugins>
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
    </plugins>
</build>
```

`@CompiledValidator` also requires `sjf4j-schema` at runtime. Other compiled APIs do not need the schema module unless they use JSON Schema functionality.

Learn more: [Compiled APIs](/docs/compiled) · [Binding](/docs/binding) · [Validating](/docs/validating)

## Spring Integration

Both options require Java 17+ and annotation processing.

### Spring Framework

For plain **Spring Framework 6.2+**, enable compiled interface registration with `@EnableSjf4j`.

::: code-group

```kotlin [Gradle (Kotlin DSL)]
implementation("org.sjf4j:sjf4j-spring:{version}")
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j-spring</artifactId>
    <version>{version}</version>
</dependency>
```

:::

```java
@Configuration
@EnableSjf4j
public class AppConfig {
}
```

### Spring Boot

For **Spring Boot 3.x**, use the Starter. It enables the same integration automatically; no `@EnableSjf4j` annotation is required.

::: code-group

```kotlin [Gradle (Kotlin DSL)]
implementation("org.sjf4j:sjf4j-spring-boot-starter:{version}")
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j-spring-boot-starter</artifactId>
    <version>{version}</version>
</dependency>
```

:::

Both options bring in `sjf4j-core` transitively. For Maven, configure the [annotation processor](#compiled-apis) separately. Other optional SJF4J modules are added as needed.

See [Spring Integration](/docs/spring-integration) for dependency injection, Spring `Converter`, and `JdbcTemplate` examples.
