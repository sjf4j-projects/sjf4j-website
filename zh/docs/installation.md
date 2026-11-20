---
title: "安装指南"
description: "使用 Gradle 或 Maven 安装 SJF4J，选择所需模块和后端，并启用 Compiled API。"
translationSourceSha: "52754f09b594d169550911fd62f0d59a64dbdb50"
---

# 安装指南 {#installation}

SJF4J 支持 **Java 8+**。部分后端所依赖的第三方库可能要求更高的 Java 版本。

将示例中的 `{version}` 替换为 [![Maven Central 最新版本](https://img.shields.io/maven-central/v/org.sjf4j/sjf4j)](https://central.sonatype.com/artifact/org.sjf4j/sjf4j)。

文档可能包含尚未正式发布的功能。请以对应依赖版本的 Javadoc 为准；[最新 Javadoc](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/) 对应最新发布的 API。

## 快速配置 {#quick-setup}

安装 `sjf4j-core`，然后按需添加其他模块。以下使用 **Jackson 2.x** 作为 JSON 后端。

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

`sjf4j-core` 内置 Simple JSON 和 Java Properties 支持，使用这些格式时不需要外部后端。Maven 项目如需使用 Compiled API，还需单独配置[注解处理器](#compiled-apis)。

## 模块 {#modules}

![SJF4J 模块依赖关系](/diagrams/sjf4j-module-dependencies.svg)

| 模块 | 用途 | 依赖 |
| --- | --- | --- |
| `sjf4j-core` | 结构化 API、数据绑定、导航、映射和补丁 | — |
| `sjf4j-schema` | JSON Schema 校验 | Core |
| `sjf4j-processor` | 编译时代码生成 | Core、Schema |
| `sjf4j-spring` | 将编译式接口注册为 Spring Bean（Java 17+） | Core、Spring Framework |
| `sjf4j-spring-boot-starter` | Compiled API 的 Spring Boot 自动配置（Java 17+） | Spring、Spring Boot |
| `sjf4j-backend-*` | JSON/YAML 后端适配器 | Core |
| `sjf4j` | 聚合模块：Core、Schema 和六种适配器 | 上述模块（不含 Processor） |

**推荐按需引入模块**，以精简类路径。也可以直接使用聚合依赖：

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

聚合模块会传递引入全部六种 **SJF4J 适配器**及其原生第三方库，但不包含注解处理器。

## 后端 {#backends}

SJF4J 内置及可选后端如下：

| 格式 | 后端 | SJF4J 模块 | 包含的第三方库 |
| --- | --- | --- | --- |
| JSON | Jackson 3.x | `sjf4j-backend-jackson3` | `tools.jackson.core:jackson-databind:3.2.3` |
| JSON | Jackson 2.x | `sjf4j-backend-jackson2` | `com.fasterxml.jackson.core:jackson-databind:2.22.3` |
| JSON | Gson | `sjf4j-backend-gson` | `com.google.code.gson:gson:2.13.1` |
| JSON | Fastjson2 | `sjf4j-backend-fastjson2` | `com.alibaba.fastjson2:fastjson2:2.0.66` |
| JSON | JSON-P | `sjf4j-backend-jsonp` | `jakarta.json:jakarta.json-api:2.1.3`，以及提供者 `org.eclipse.parsson:parsson:1.1.7` |
| JSON | Simple | `sjf4j-core` | 无 |
| YAML | SnakeYAML | `sjf4j-backend-snake` | `org.yaml:snakeyaml:2.5` |
| Properties | 内置 | `sjf4j-core` | 无 |

表中的版本为 SJF4J 项目当前使用的版本，其他兼容版本也可能正常工作。各后端模块会传递引入对应的第三方库；JSON-P 模块还会默认引入 Parsson 作为运行时提供者。

**JSON 后端自动选择优先级（由高到低）：**

**Jackson 3 → Jackson 2 → Gson → Fastjson2 → JSON-P → Simple**

SJF4J 按此顺序选择第一个可用后端。Runtime Binding 通过 `ServiceLoader` 发现提供者；`@CompiledBinder(backend = Backend.AUTO)` 在编译期选择后端。两者都要求相应适配器及原生库可用（JSON-P 还需要实现库）。Simple 是内置回退选项。

YAML 在 SnakeYAML 可用时使用它；Java Properties 无需额外依赖。选择规则及显式指定方法参阅 [Backends & Formats](/docs/backends#backend-selection)。

## Compiled APIs {#compiled-apis}

将 `sjf4j-processor` 添加到**注解处理器路径**，而不是作为普通运行时依赖。

**Gradle：** 使用[快速配置](#quick-setup)中的 `annotationProcessor(...)`。

**Maven：** 配置 Compiler Plugin：

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

`@CompiledValidator` 在运行时还需要 `sjf4j-schema`。其他 Compiled API 不使用 JSON Schema 功能时，无须引入该模块。

延伸阅读：[Compiled APIs](/docs/compiled) · [Binding](/docs/binding) · [Validating](/docs/validating)

## Spring 集成 {#spring-integration}

以下两种方式均要求 **Java 17+** 并启用注解处理。

### Spring Framework {#spring-framework}

使用原生 **Spring Framework 6.2+** 时，通过 `@EnableSjf4j` 启用编译式接口注册。

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

### Spring Boot {#spring-boot}

使用 **Spring Boot 3.x** 时，引入 Starter 即可自动启用相同的集成功能，无须添加 `@EnableSjf4j`。

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

两种方式都会传递引入 `sjf4j-core`。Maven 项目仍需单独配置[注解处理器](#compiled-apis)，其他可选 SJF4J 模块按需添加。

有关依赖注入、Spring `Converter` 和 `JdbcTemplate` 示例，参阅 [Spring Integration](/docs/spring-integration)。
