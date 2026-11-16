---
title: "Installation"
description: "Select SJF4J modules, backends, and annotation processing for Gradle or Maven."
---

# Installation

SJF4J requires **Java 8+** and supports modular installation. <span class="maven-release-inline">The latest version is: <a href="https://central.sonatype.com/search?q=sjf4j"><img src="https://img.shields.io/maven-central/v/org.sjf4j/sjf4j" alt="Maven Central" /></a></span>

Replace `{version}` in the following examples with the latest stable version shown above.

## Gradle (Kotlin DSL)

```kotlin
// Core structural processing API
implementation("org.sjf4j:sjf4j-core:{version}")

// Optional: Compile-time APIs
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")

// Optional: JSON Schema validation
implementation("org.sjf4j:sjf4j-schema:{version}")

// Optional: Backend and its dependency (Jackson 2.x example) 
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")
```

## Maven

Add the corresponding dependencies and, when using compiled APIs, configure the Maven compiler plugin's annotation processor path:

```xml
<dependencies>
    <!-- Core structural processing API -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-core</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: JSON Schema validation -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-schema</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: Backend and its dependency (Jackson 2.x example) -->
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
</dependencies>

<!-- Optional: Compile-time APIs -->
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

All modules are optional except `sjf4j-core`. The Jackson 2.x backend is just an example; choose the JSON or YAML backend that fits your project.

Learn more → [Backends & Formats](/docs/backends) · [Compiled APIs](/docs/compiled)
