---
title: "Installation"
description: "Install SJF4J with Gradle or Maven, understand its module dependencies, and choose from every supported backend."
---

# Installation

SJF4J is modular: start with the core APIs, then add only the capabilities and data-format backends your application needs. It supports **Java 8+**; the selected third-party backend library may impose its own Java version requirements.

<span class="maven-release-inline">Latest stable release: <a href="https://central.sonatype.com/artifact/org.sjf4j/sjf4j"><img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central version" /></a></span>

Use the same SJF4J `{version}` for every `org.sjf4j` artifact below. Replace `{version}` with the current version shown above.

## Choose an Installation

| Setup | What to install |
| --- | --- |
| **Core only** | `sjf4j-core` — structural APIs, JSONPath, patching, mapping and built-in Simple JSON/Properties binding |
| **Core + one backend** | `sjf4j-core` + one backend adapter + its third-party library |
| **JSON Schema validation** | Add `sjf4j-schema` |
| **Compiled APIs** | Add `sjf4j-processor` to the **annotation processor** path |
| **All-in-one** | Use `sjf4j` to bring in core, schema and all six adapters; add the third-party libraries you actually want |

The **modular installation** is recommended when you want a small, predictable dependency graph. The **all-in-one artifact** is convenient for experimentation or applications that use several backends.

### All-in-one

```kotlin
// Gradle (Kotlin DSL)
implementation("org.sjf4j:sjf4j:{version}")
```

```xml
<!-- Maven -->
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j</artifactId>
    <version>{version}</version>
</dependency>
```

The `sjf4j` artifact includes `sjf4j-core`, `sjf4j-schema` and **all six SJF4J backend adapters** as transitive dependencies. However, the adapters declare their third-party libraries as `compileOnly`, so **the all-in-one artifact does not automatically install Jackson, Gson, Fastjson2, JSON-P or SnakeYAML**. Add the library (or libraries) you intend to use, as described in [Backend Reference](#backend-reference).

The annotation processor is **not** included in `sjf4j`. Configure it separately when using Compiled APIs.

## Module Dependencies

![SJF4J published module dependency graph](/diagrams/sjf4j-module-dependencies.svg)

The diagram distinguishes **direct module dependencies** (solid lines) from the dependencies included by the `sjf4j` bundle (dashed lines). Third-party backend libraries are not shown as module-to-module dependencies because they are optional, separate dependencies.

| Module | Purpose | SJF4J dependencies |
| --- | --- | --- |
| `sjf4j-core` | OBNT, runtime structural APIs, shared binding contracts and built-in Simple JSON/Properties | None |
| `sjf4j-schema` | Runtime JSON Schema validation and runtime support for compiled validators | `sjf4j-core` |
| `sjf4j-processor` | Generates Compiled API implementations at build time | `sjf4j-core`, `sjf4j-schema` |
| `sjf4j-backend-*` | Format-specific parser/writer adapters | `sjf4j-core` |
| `sjf4j` | Convenience aggregate artifact | Core, schema and all six backend adapters |

**Important distinctions:**

- `sjf4j-schema` is not necessary for ordinary JSON binding, navigation, mapping or patching. Add it for runtime JSON Schema validation **and** when using `@CompiledValidator`; generated validators reference schema runtime classes.
- `sjf4j-processor` runs during compilation; it is **not** a normal application runtime dependency. It uses schema support internally to generate compiled validators.
- Every external adapter depends on `sjf4j-core`, but its underlying JSON/YAML library must be available separately. If your application already has a compatible library, you can reuse it.
- The built-in **Simple JSON** and **Java Properties** implementations live in `sjf4j-core`; they do **not** require additional backend artifacts.
- Developer-oriented source modules such as `sjf4j-asm` and `sjf4j-testbench` are not part of the standard published installation graph.

## Modular Installation

The following examples select **Jackson 2.x** as the JSON backend. Substitute any supported backend from the [complete matrix](#backend-reference). All SJF4J artifacts use the same version.

### Gradle (Kotlin DSL)

```kotlin
repositories {
    mavenCentral()
}

dependencies {
    // Core structural APIs
    implementation("org.sjf4j:sjf4j-core:{version}")

    // JSON backend: adapter AND underlying library
    implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")

    // Optional: JSON Schema validation (runtime or compiled)
    implementation("org.sjf4j:sjf4j-schema:{version}")

    // Optional: compile-time generated APIs
    annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
}
```

Only `sjf4j-core` is required for core structural operations. Remove either optional line if your application does not use that capability; remove the backend lines if the built-in Simple JSON implementation is sufficient.

### Maven

```xml
<dependencies>
    <!-- Core structural APIs -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-core</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- JSON backend: adapter AND underlying library -->
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

    <!-- Optional: JSON Schema validation (runtime or compiled) -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-schema</artifactId>
        <version>{version}</version>
    </dependency>
</dependencies>
```

For Maven annotation processing, see [Enable Compiled APIs](#enable-compiled-apis).

## Backend Reference

These are **all six published SJF4J backend adapters**, plus the built-in implementations. Third-party coordinates below use versions from the current SJF4J build as **known examples**, not strict version requirements. Check compatibility and Java requirements when using a different version.

| Format / backend | SJF4J artifact | Third-party dependency |
| --- | --- | --- |
| JSON — **Simple** (built-in) | `sjf4j-core` | None |
| JSON — **Jackson 2.x** | `sjf4j-backend-jackson2` | `com.fasterxml.jackson.core:jackson-databind:2.22.3` |
| JSON — **Jackson 3.x** | `sjf4j-backend-jackson3` | `tools.jackson.core:jackson-databind:3.2.3` |
| JSON — **Gson** | `sjf4j-backend-gson` | `com.google.code.gson:gson:2.13.1` |
| JSON — **Fastjson2** | `sjf4j-backend-fastjson2` | `com.alibaba.fastjson2:fastjson2:2.0.66` |
| JSON — **JSON-P** | `sjf4j-backend-jsonp` | `jakarta.json:jakarta.json-api:2.1.3` **and** a provider, e.g. `org.eclipse.parsson:parsson:1.1.7` |
| YAML — **SnakeYAML** | `sjf4j-backend-snake` | `org.yaml:snakeyaml:2.5` |
| Java Properties — built-in | `sjf4j-core` | None (JDK `java.util.Properties`) |

### Gradle: Every Backend

For each external backend, add **both** lines shown. This is a complete reference, **not a recommendation to install all six**. Choose the backends your application uses.

```kotlin
// Jackson 2.x (JSON)
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")

// Jackson 3.x (JSON)
implementation("org.sjf4j:sjf4j-backend-jackson3:{version}")
implementation("tools.jackson.core:jackson-databind:3.2.3")

// Gson (JSON)
implementation("org.sjf4j:sjf4j-backend-gson:{version}")
implementation("com.google.code.gson:gson:2.13.1")

// Fastjson2 (JSON)
implementation("org.sjf4j:sjf4j-backend-fastjson2:{version}")
implementation("com.alibaba.fastjson2:fastjson2:2.0.66")

// JSON-P (JSON): API and provider are both needed
implementation("org.sjf4j:sjf4j-backend-jsonp:{version}")
implementation("jakarta.json:jakarta.json-api:2.1.3")
implementation("org.eclipse.parsson:parsson:1.1.7")

// SnakeYAML (YAML)
implementation("org.sjf4j:sjf4j-backend-snake:{version}")
implementation("org.yaml:snakeyaml:2.5")
```

### Maven: Every Backend

Likewise, select the matching adapter and underlying library from these examples; **do not add all of them unless you need them**.

```xml
<dependencies>
    <!-- Jackson 2.x -->
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

    <!-- Jackson 3.x -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jackson3</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>tools.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>3.2.3</version>
    </dependency>

    <!-- Gson -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-gson</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.13.1</version>
    </dependency>

    <!-- Fastjson2 -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-fastjson2</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba.fastjson2</groupId>
        <artifactId>fastjson2</artifactId>
        <version>2.0.66</version>
    </dependency>

    <!-- JSON-P: API and a provider -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jsonp</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>jakarta.json</groupId>
        <artifactId>jakarta.json-api</artifactId>
        <version>2.1.3</version>
    </dependency>
    <dependency>
        <groupId>org.eclipse.parsson</groupId>
        <artifactId>parsson</artifactId>
        <version>1.1.7</version>
    </dependency>

    <!-- SnakeYAML -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-snake</artifactId>
        <version>{version}</version>
    </dependency>
    <dependency>
        <groupId>org.yaml</groupId>
        <artifactId>snakeyaml</artifactId>
        <version>2.5</version>
    </dependency>
</dependencies>
```

### How Backend Selection Works

At runtime, SJF4J discovers backend adapters using Java's `ServiceLoader`. The available provider with the highest priority is selected **per format**:

- **JSON**: without an available external JSON provider, SJF4J uses **Simple JSON** from `sjf4j-core`.
- **YAML**: use `sjf4j-backend-snake` **and** `org.yaml:snakeyaml`. YAML reading/writing is unavailable without an installed YAML provider.
- **Java Properties**: provided directly by `sjf4j-core` with no external dependency.

If several JSON backends are installed, the default is chosen by provider priority rather than by dependency declaration order. For a predictable default, install only the backend you intend to use, or configure a specific provider explicitly.

For Compiled Binding, `Backend.AUTO` is resolved **at compile time** using the supported backends visible on the compilation classpath. It does not simply inherit the runtime default provider selection; make sure the intended adapter and its library are available while compiling.

## Enable Compiled APIs

Compiled navigators, binders, mappers, JDBC row mappers and validators are generated by Java annotation processing. The annotations and shared runtime contracts live in `sjf4j-core`; the code generator lives in the **separate** `sjf4j-processor` module.

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("org.sjf4j:sjf4j-core:{version}")
    annotationProcessor("org.sjf4j:sjf4j-processor:{version}")

    // Required when using @CompiledValidator
    implementation("org.sjf4j:sjf4j-schema:{version}")

    // Add a backend + its library for compiled data binding.
}
```

### Maven

Keep your runtime dependencies in `<dependencies>` and configure the processor separately:

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

The processor depends on `sjf4j-schema` during code generation. **Generated `@CompiledValidator` implementations also reference schema runtime classes**, so add `sjf4j-schema` as a normal application dependency when using compiled validation. Other compiled APIs do not need the schema module unless they use schema functionality.

See [Compiled APIs](/docs/compiled) for generated class names, output paths and usage.

## Common Pitfalls

- **Adapter present, library missing:** A `sjf4j-backend-*` module alone does not provide the underlying JSON/YAML implementation; add its library too.
- **Unexpected JSON backend:** With multiple external JSON adapters and libraries available, automatic selection follows provider priority. The `sjf4j` aggregate includes every adapter.
- **YAML unavailable:** Install both `sjf4j-backend-snake` and SnakeYAML.
- **JSON-P provider missing:** The Jakarta JSON-P API is not a parser implementation. Add a compatible provider, such as Parsson.
- **No generated `_Impl` class:** Check the annotation processor path and verify annotation processing is enabled in your build.
- **Compiled validator linkage error:** Include `sjf4j-schema` on the application's runtime classpath.
- **Version conflicts:** Keep SJF4J modules on the same release; verify the Java requirements of the third-party libraries you choose.

For API examples, see [Binding](/docs/binding), [Validating](/docs/validating) and [Compiled APIs](/docs/compiled).
