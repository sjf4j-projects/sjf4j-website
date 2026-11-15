---
title: "Installation"
description: "Select the SJF4J dependencies, backends, and annotation processor."
---

# Installation

SJF4J supports Java 8 and newer. Start with the all-in-one artifact or choose individual modules for a more targeted setup.

## All-in-One Dependency

```kotlin
// Gradle Kotlin DSL
implementation("org.sjf4j:sjf4j:{version}")
```
Replace `{version}` with the desired [published version](https://central.sonatype.com/search?q=org.sjf4j).

## Optional Backend Example

```kotlin
// Example: Jackson 2.x backend and its JSON library
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:{jacksonVersion}")
```
Additional backends are described in [Backends & Formats](/docs/backends).

## Compile-time APIs

```kotlin
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```
See [Compiled APIs](/docs/compiled) for setup and usage.

## Maven and Module Selection

Maven coordinates and a detailed module-selection matrix will be expanded here. The [project README](https://github.com/sjf4j-projects/sjf4j) contains the current getting-started instructions.
