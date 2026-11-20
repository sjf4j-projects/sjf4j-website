---
title: "常见问题"
description: "解答关于 SJF4J、Java 对象模型、后端、Compiled API、标准及性能的常见问题。"
translationSourceSha: "7019974e0793b1a41c2bd3882082ef369f964266"
---

# 常见问题 {#faq}

这里汇总了关于 SJF4J 的常见问题。详细 API 与配置请参阅各功能文档。

## 快速开始 {#getting-started}

### 相比 Jackson、Gson 或 Fastjson2，SJF4J 提供了什么？ {#what-does-sjf4j-add-to-jackson-gson-or-fastjson2}

SJF4J 是一个**基于 JSON 语义的结构化处理层**，不是另一个试图替代现有库的 JSON 解析器。它使用这些解析器作为后端，在同一套编程模型下提供数据绑定、导航、补丁、校验和对象映射，并且能直接操作普通 Java 对象。

如果只需要基本的 JSON 序列化，原生库可能已经足够。需要组合使用上述多种结构化操作时，SJF4J 的统一模型更有价值。

### 需要哪个 Java 版本和哪些依赖？ {#which-java-version-and-dependencies-do-i-need}

SJF4J 支持 **Java 8+**，各模块按用途拆分：

- `sjf4j-core`：核心结构化 API 和运行时操作。
- `sjf4j-backend-*`：所选数据后端的可选适配器。
- `sjf4j-schema`：JSON Schema 校验。
- `sjf4j-processor`：为Compiled API 提供注解处理器。

所选后端需要其底层解析器库。Processor 用于**编译期**，不是通用的运行时依赖。

参阅 [Installation](/docs/installation)。

### 支持哪些格式和后端？ {#which-formats-and-backends-are-supported}

JSON 支持 **Jackson 2.x、Jackson 3.x、Gson、Fastjson2、JSON-P** 以及内置的 Simple 实现。还支持通过 SnakeYAML 处理 **YAML**、处理 **Java Properties**，以及直接对内存中的 Java 对象图执行结构化操作。

可以自动选择后端，也可以显式配置 Provider。内置 Simple JSON 是回退实现，并非专用解析器的性能替代品。YAML 需要 SnakeYAML。

参阅 [Backends & Formats](/docs/backends)。

## 使用 Java 对象 {#working-with-java-objects}

### 什么是 OBNT？SJF4J 会额外创建 JSON 树吗？ {#what-is-obnt-does-sjf4j-create-a-separate-json-tree}

**OBNT (Object-Based Node Tree)** 将受支持的 Java 值作为结构化节点：

| 节点类型 | 典型表示 |
| --- | --- |
| 对象 | `Map`、POJO、`JsonObject`、JOJO |
| 数组 | `List`、Java 数组、`JsonArray`、JAJO |
| 值 | 字符串、数字、布尔值及受支持的自定义值 |

SJF4J 可以直接操作这些结构，**不需要**先把每个 POJO 或 Map 转换为某个库专用的 JSON AST。

参阅 [Modeling (OBNT)](/docs/modeling)。

### 什么时候使用 POJO、JOJO 或 JAJO？ {#when-should-i-use-a-pojo-jojo-or-jajo}

稳定且强类型的对象模型，优先使用普通 **POJO**。需要同时保留强类型属性和未知、动态 JSON 成员时，使用继承 `JsonObject` 的 **JOJO**。需要可扩展的数组式模型时，使用基于 `JsonArray` 的 **JAJO**。

使用 SJF4J 不要求修改已有的领域类。JOJO 和 JAJO 是可选的建模方式，而不是必需条件。

参阅 [Modeling (OBNT)](/docs/modeling)。

### 没有来自 JSON 的对象也能查询、修改或校验吗？ {#can-i-query-modify-or-validate-objects-that-never-came-from-json}

**可以。** JSONPath、JSON Pointer、JSON Patch 和 JSON Schema 校验都可以直接作用于受支持的 Java 对象图，包括现有的 POJO、Map 和 List，不必先序列化再解析。

不过，能否修改取决于目标结构。例如，不可变对象不能像可变 Map 一样直接更新。

参阅 [Navigating](/docs/navigating)、[Patching](/docs/patching) 和 [Validating](/docs/validating)。

### 未知字段、多态类型和自定义值如何处理？ {#how-are-unknown-fields-polymorphic-types-and-custom-values-handled}

动态Object Node可以保留任意成员；**JOJO** 将这种能力与声明的 Java 属性结合起来。多态绑定可通过 `@OneOf` 按判别信息选择子类型。自定义标量可以通过 `@NodeValue` 和 `ValueCodec` 建模。

SJF4J 还提供 `ExternalNode`，用于集成受支持的第三方节点模型；也允许通过流式扩展点支持自定义数据格式。

参阅 [Modeling (OBNT)](/docs/modeling) 和 [Binding](/docs/binding)。

## Runtime 与 Compiled API {#runtime-and-compiled-apis}

### 什么时候使用 Runtime API，什么时候使用 Compiled API？ {#when-should-i-use-runtime-apis-versus-compiled-apis}

当路径、Schema、目标类型或转换逻辑需要**动态决定**时，使用 **Runtime API**。当操作稳定、调用频繁且能够利用专用代码生成时，使用 **Compiled API**。

Compiled API 可以减少运行时解释和通用分派的开销，但**并非在每种负载中都更快**，也有各自的功能限制，所以 Runtime API 仍然重要。

参阅 [Compiled APIs](/docs/compiled) 和 [Benchmarks](/docs/benchmarks)。

### SJF4J 可以在编译期生成什么？ {#what-can-sjf4j-generate-at-compile-time}

| 注解 | 生成能力 |
| --- | --- |
| `@CompiledBinder` | 专用读取器与写入器的数据绑定 |
| `@CompiledNavigator` | JSONPath 访问、查询和更新 |
| `@CompiledValidator` | 针对静态绑定 Schema 的 JSON Schema 校验 |
| `@CompiledMapper` | Java 对象之间的映射 |
| `@CompiledJdbcMapper` | JDBC `ResultSet` 映射 |

生成的是**普通 Java 实现类**，不需要独立的运行时或字节码解释器。

参阅 [Compiled APIs](/docs/compiled)。

### 如何使用和查看生成的实现？ {#how-do-i-use-and-inspect-generated-implementations}

将 `sjf4j-processor` 配置为 Gradle 或 Maven 的注解处理器，声明带注解的接口，再通过 `CompiledInstances.create(...)` 创建实例。

生成类以 `_Impl` 结尾，源码位于标准的注解处理输出目录。例如，Gradle 为 `build/generated/sources/annotationProcessor/java/main`，Maven 为 `target/generated-sources/annotations`。这些文件可以直接阅读和调试。

参阅 [Installation](/docs/installation) 和 [Compiled APIs](/docs/compiled)。

### 如果某个操作无法编译怎么办？ {#what-if-an-operation-cannot-be-compiled}

支持范围取决于具体注解和操作。遇到不支持的情况，Processor 可能在编译期报错；部分 API 在显式配置时允许**回退到 Runtime 执行**。不能假设所有动态 JSONPath 表达式、Mapper 转换或 Schema 关键字都能完整编译。

对于必须动态执行的操作，应选择 Runtime API；引入编译式代码前，也应查看相应功能的限制。

参阅 [Compiled APIs](/docs/compiled)。

### 不使用 ORM 能映射 JDBC 结果吗？ {#can-sjf4j-map-jdbc-results-without-an-orm}

**可以。** `@CompiledJdbcMapper` 为 JDBC `ResultSet` 行生成到 Java 对象的直接映射，支持单对象、列表映射，以及可复用且无状态的 `JdbcRowMapper<T>`，并可配置列名匹配规则。

这只是**结果映射**，不是 ORM 或 SQL 执行框架。连接、查询和事务仍由应用自己管理。

参阅 [JDBC Result Mapping](/docs/jdbc-mapping)。

## 标准、性能与兼容性 {#standards-performance-and-compatibility}

### 支持哪些 JSON 标准？ {#which-json-standards-does-sjf4j-support}

SJF4J 提供基于下列标准的 JSON 结构化操作：

- **JSONPath**：RFC 9535，查询。
- **JSON Pointer**：RFC 6901，节点定位。
- **JSON Patch**：RFC 6902，有序变更。
- **JSON Merge Patch**：RFC 7386，基于对象的变更。
- **JSON Schema**：Draft 2020-12、2019-09 和 7。

SJF4J 还提供非标准的 **Indexed Merge Patch** 扩展，用于按数组下标合并。标准行为与 SJF4J 特有的修改扩展应当区分。

参阅 [Navigating](/docs/navigating)、[Patching](/docs/patching) 和 [Validating](/docs/validating)。

### JSON Schema 能直接校验 POJO 吗？ {#can-json-schema-validate-a-pojo-directly}

**可以。** `sjf4j-schema` 通过 OBNT 直接校验受支持的 Java 对象图，不需要 JSON 序列化往返过程。Runtime 支持 **Draft 2020-12、2019-09 和 7**；`@CompiledValidator` 可以针对静态已知的 Schema 生成专用实现，但受编译覆盖范围和 fallback 规则约束。

参阅 [Validating](/docs/validating)。

### SJF4J 相比原生解析器或其他框架有多快？ {#how-fast-is-sjf4j-compared-with-native-parsers-and-other-frameworks}

这取决于**后端、数据模型、操作和测试负载**。Runtime API 更通用；Compiled API 可消除其中部分开销。有些编译式场景明显快于直接使用后端或其他框架，有些则接近持平，甚至更慢。

[Benchmarks](/docs/benchmarks) 页面将项目自己的 JMH 数据与独立第三方比较分开列出，并提供工作负载、原始结果和测试配置。应比较同类操作，而不是假设存在统一的加速倍数。

### 支持 GraalVM Native Image 吗？ {#does-sjf4j-support-graalvm-native-image}

Compiled Binding 已经在 **GraalVM Native Image** 和 JVM 上进行过基准测试。Native Image 的兼容性和性能仍取决于所选后端、可达代码及构建配置。

参阅 [GraalVM Native Image Benchmarks](/docs/benchmarks#binding-on-graalvm-native-image)。

### 近期版本有哪些变化？在哪里提问？ {#what-changed-in-recent-releases-and-where-can-i-ask-questions}

1.5.x 系列引入了模块化构件并扩展了编译期支持。如果从旧版本升级，需要注意更名的 API，例如 `@CompiledPath` → `@CompiledNavigator`、`CompiledNodes` → `CompiledInstances`。1.5.1 也调整了 Mapper 转换器配置和 JDBC 行 Mapper 方法签名。

版本变更参阅 [Changelog](https://github.com/sjf4j-projects/sjf4j/blob/main/CHANGELOG.md)。问题、缺陷或功能建议可通过 [GitHub Issue](https://github.com/sjf4j-projects/sjf4j/issues) 提交。
