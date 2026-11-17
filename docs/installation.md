---
title: "Installation"
description: "Install SJF4J with Gradle or Maven, choose modules and backends, and enable compiled APIs."
---

# Installation

SJF4J supports **Java 8+**. Individual backend libraries may require a newer Java version.

Replace every `{version}` with the current [![Maven Central version](https://img.shields.io/maven-central/v/org.sjf4j/sjf4j)](https://central.sonatype.com/artifact/org.sjf4j/sjf4j).

## Quick Setup

Install `sjf4j-core` and add only the modules you need. These examples use **Jackson 2.x** as the JSON backend.

::: code-group

```kotlin [Gradle (Kotlin DSL)]
dependencies {
    implementation("org.sjf4j:sjf4j-core:{version}")

    // Optional: Jackson 2.x backend and its library
    implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")

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

    <!-- Optional: Jackson 2.x backend and its library -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jackson2</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.22.3</version>
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

The aggregate includes all six **SJF4J adapters**, but **not their third-party libraries** or the annotation processor.

## Backends

The complete set of built-in and optional backends:

| Format | Backend | SJF4J module | Required third-party library |
| --- | --- | --- | --- |
| JSON | Simple | `sjf4j-core` | None |
| JSON | Jackson 2.x | `sjf4j-backend-jackson2` | `com.fasterxml.jackson.core:jackson-databind:2.22.3` |
| JSON | Jackson 3.x | `sjf4j-backend-jackson3` | `tools.jackson.core:jackson-databind:3.2.3` |
| JSON | Gson | `sjf4j-backend-gson` | `com.google.code.gson:gson:2.13.1` |
| JSON | Fastjson2 | `sjf4j-backend-fastjson2` | `com.alibaba.fastjson2:fastjson2:2.0.66` |
| JSON | JSON-P | `sjf4j-backend-jsonp` | `jakarta.json:jakarta.json-api:2.1.3` and provider `org.eclipse.parsson:parsson:1.1.7` |
| YAML | SnakeYAML | `sjf4j-backend-snake` | `org.yaml:snakeyaml:2.5` |
| Properties | Built-in | `sjf4j-core` | None |

The versions shown are those used by the SJF4J project; compatible library versions may also work. For each external backend, add **both its SJF4J module and third-party library**. The libraries are not transitively included.

**Selection:** SJF4J discovers backends through `ServiceLoader` and selects the highest-priority available provider for each format. JSON falls back to Simple when no external backend is available. YAML requires SnakeYAML. For `@CompiledBinder`, `Backend.AUTO` resolves against the compilation classpath instead.

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
