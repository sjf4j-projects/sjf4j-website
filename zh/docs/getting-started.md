---
title: "快速开始"
description: "了解 SJF4J 的核心能力，并通过示例快速上手。"
---

# 快速开始 {#getting-started}

![License](https://img.shields.io/github/license/sjf4j-projects/sjf4j)
[![Maven Central](https://img.shields.io/maven-central/v/org.sjf4j/sjf4j)](https://central.sonatype.com/search?q=sjf4j)
[![javadoc](https://javadoc.io/badge2/org.sjf4j/sjf4j-core/javadoc.svg)](https://javadoc.io/doc/org.sjf4j/sjf4j-core)
![Supported Dialects](https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fsupported_versions.json)  
![Draft 2020-12](https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft2020-12.json)
![Draft 2019-09](https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft2019-09.json)
![Draft 7](https://img.shields.io/endpoint?url=https%3A%2F%2Fbowtie.report%2Fbadges%2Fjava-org.sjf4j-sjf4j%2Fcompliance%2Fdraft7.json)    
![Build](https://img.shields.io/github/actions/workflow/status/sjf4j-projects/sjf4j/gradle.yml?branch=main)
[![codecov](https://codecov.io/gh/sjf4j-projects/sjf4j/graph/badge.svg?branch=main)](https://codecov.io/gh/sjf4j-projects/sjf4j)
![Stars](https://img.shields.io/github/stars/sjf4j-projects/sjf4j?style=social)

**SJF4J (Simple JSON Facade for Java)** 是一个**基于 JSON 语义的统一结构化数据处理层**，集数据绑定、导航、校验、映射和补丁操作于一体。

- **JSON 语义，原生 Java 对象**  
  将 [JSONPath](https://www.rfc-editor.org/info/rfc9535/)、[JSON Pointer](https://www.rfc-editor.org/info/rfc6901/)、[JSON Patch](https://www.rfc-editor.org/info/rfc6902/) 和 [JSON Schema](https://json-schema.org/) 直接用于 POJO、Map、List 等 Java 对象，无须构建中间 JSON 树。

- **多种后端，统一 API**  
  通过统一 API 使用 JSON 后端（[Jackson 2.x/3.x](https://github.com/FasterXML/jackson-databind)、[Gson](https://github.com/google/gson)、[Fastjson2](https://github.com/alibaba/fastjson2)、[JSON-P](https://github.com/jakartaee/jsonp-api)）、YAML（[SnakeYAML](https://github.com/snakeyaml/snakeyaml)）及其他格式。

- **运行时灵活，编译期高效**  
  使用灵活的 Runtime API，或通过注解处理器生成高度优化的 Java 代码。

## 快速上手 {#quickstart}

SJF4J 支持 **Java 8+**。按需添加模块（Gradle）：

```kotlin
dependencies {
    implementation("org.sjf4j:sjf4j-core:{version}")

    // Optional: Jackson 2.x backend (includes Jackson dependencies)
    implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")

    // Optional: Compiled APIs
    annotationProcessor("org.sjf4j:sjf4j-processor:{version}")

    // Optional: JSON Schema validation
    implementation("org.sjf4j:sjf4j-schema:{version}")
}
```

将 `{version}` 替换为 [Maven Central](https://central.sonatype.com/artifact/org.sjf4j/sjf4j) 上的最新版本。Maven 配置及更多模块请参阅[安装指南](/docs/installation)。

**从普通 Java 类开始：**

```java
public class User {
    public String name;
    public int age;
    public Address address;
}

public class Address {
    public String city;
}
```

**直接使用 JSON 风格的 API 操作这些对象：**

```java
String json = "{\"name\":\"Alice\",\"age\":18,\"address\":{\"city\":\"Beijing\"}}";

// JSON → POJO
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);

// Modify the POJO directly using JSONPath
JsonPath.parse("$.address.city").put(user, "Chongqing");

// POJO → JSON
String output = sjf4j.toJsonString(user);
```

不需要特殊父类、注解或中间 JSON 树。

## 核心功能 {#explore-features}

下表列出了 SJF4J 的主要能力及对应的 Runtime 和 Compiled API。

| 功能 | 能力 | Runtime | Compiled |
| --- | --- | --- | --- |
| Binding | 数据绑定 | `Sjf4j.from/toXxx()` | `@CompiledBinder` |
| Navigating | JSONPath 导航 | `JsonPath` | `@CompiledNavigator` |
| Validating | JSON Schema 校验 | `JsonSchema` | `@CompiledValidator` |
| Mapping | 对象映射 | `Sjf4j.convert()` | `@CompiledMapper` |
| — | JDBC 结果映射 | — | `@CompiledJdbcMapper` |
| Patching | JSON Patch 与 Merge Patch | `JsonPatch` | — |
| Modeling | 结构化对象操作 | `Nodes` | — |

### 数据绑定 {#binding}

SJF4J 提供统一的数据绑定接口，支持 [JSON](https://www.rfc-editor.org/info/rfc8259)、[YAML](https://yaml.org/spec/1.2.2/) 和 [Java Properties](https://docs.oracle.com/javase/8/docs/api/java/util/Properties.html)，以及 POJO、Map、List、泛型和自定义值类型。

**Runtime**

```java
Sjf4j sjf4j = new Sjf4j();

User user = sjf4j.fromJson(json, User.class);
String yaml = sjf4j.toYamlString(user);
```

**Compiled**

```java
@CompiledBinder
interface UserJsonBinder {
    @Read User read(String json);
}
```

开放的流式架构支持自定义数据格式与后端。绑定功能还包括 `@OneOf` 多态、跨格式 `ValueCodec` 以及 `ExternalNode` 集成。

了解更多 → [Binding](/docs/binding)

### 对象导航 {#navigating}

通过 [JSONPath (RFC 9535)](https://www.rfc-editor.org/info/rfc9535/) 或 [JSON Pointer (RFC 6901)](https://www.rfc-editor.org/info/rfc6901/) 查询和修改 Java 对象图。

**Runtime**

```java
JsonPath path = JsonPath.parse("$.address.city");

String city = path.getString(user);     // Read a property
path.put(user, "Chongqing");            // Update a property
```

**Compiled**

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);

    @PutByPath("$.address.city")
    String putCity(User user, String city);
}
```

SJF4J 将符合标准的 JSONPath 查询与结构化导航、修改结合起来，直接操作 Java 对象，无须转换为中间 JSON 树。

了解更多 → [Navigating](/docs/navigating)

### 数据校验 {#validating}

直接使用 [JSON Schema](https://json-schema.org/) 校验 Java 对象，无须先构建 JSON 树。

**Runtime**

```java
JsonSchema schema = JsonSchema.fromJson("""
{
  "type": "object",
  "properties": {
    "name": {"type": "string", "minLength": 1},
    "age": {"type": "integer", "minimum": 0}
  },
  "required": ["name"]
}
""");

SchemaPlan plan = schema.createPlan();
ValidationResult result = plan.validate(user);
```

**Compiled**

```java
@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}
```

支持 JSON Schema Draft **2020-12**、**2019-09** 和 **7**，包括完整校验和注解收集。

*实验性功能：还可以通过在线 [Schema-to-Java Generator](/generator)，由 JSON Schema 生成 Java 模型。*

了解更多 → [Validating](/docs/validating)

### 对象映射 {#mapping}

在 Map、POJO、值类型和嵌套 Java 对象结构之间进行转换。

**Runtime**

```java
public class AnotherUser {
  public String fullName;
  public int age;
}

AnotherUser user = sjf4j.convert(user, AnotherUser.class);
```

**Compiled**

`@CompiledMapper` 支持属性重命名、嵌套映射、自定义表达式和对象创建策略。

```java
@CompiledMapper
interface UserMapper {
    @Mapping(target = "fullName", source = "name")
    AnotherUser toAnother(User user);
}
```

了解更多 → [Object Mapping](/docs/mapping)

`@CompiledJdbcMapper` 可以生成从 JDBC `ResultSet` 到 Java 对象的直接映射：

```java
@CompiledJdbcMapper
interface UserJdbcMapper {
    List<User> users(ResultSet resultSet);
}
```

了解更多 → [JDBC Result Mapping](/docs/jdbc-mapping)

### 对象补丁 {#patching}

将 [JSON Patch (RFC 6902)](https://www.rfc-editor.org/info/rfc6902/) 和 [JSON Merge Patch (RFC 7386)](https://www.rfc-editor.org/info/rfc7386/) 直接应用于 Java 对象图。

```java
JsonPatch patch = JsonPatch.fromJson("""
        [{"op": "replace", "path": "/name", "value": "Alice Zhang"}]
        """);

patch.apply(user);  // Update in place
```

了解更多 → [Patching](/docs/patching)

### 对象模型 {#modeling}

**OBNT (Object-Based Node Tree)** 是 SJF4J API 共用的结构化对象模型。它让 JSON 语义可以直接应用于原生 Java 对象，不需要中间 JSON 树。

OBNT 定义了三种节点：

| 节点类型 | Java 表示 |
| --- | --- |
| **对象节点** | `Map`、POJO、`JsonObject`、JOJO |
| **数组节点** | `List`、Java 数组、`JsonArray`、JAJO |
| **值节点** | 字符串、数字、布尔值及自定义值类型 |

通过 `Nodes` API 可以统一操作这些结构。

```java
// Access and convert property values
Object raw = Nodes.getInObject(user, "name");
String name = Nodes.toString(raw);

// Iterate over object properties
Nodes.forEachObject(user, (key, value) -> 
        System.out.println(key + ": " + value));

// Compare objects by JSON semantics
if (!Nodes.equals(user, userMap)) {
    // Inspect object structure
    System.out.println("user: " + Nodes.inspect(user));   
}
```

OBNT 支持可扩展的对象模型：

- 继承 `JsonObject` 创建 **JOJO (JSON Object Java Object)**，同时支持强类型属性和动态成员。
- 继承 `JsonArray` 创建 **JAJO (JSON Array Java Object)**，构建可扩展的类型化数组节点。
- 使用 `@NodeValue` 将 Java 类型建模为逻辑值节点。
- 使用 `@OneOf` 定义多态节点类型。
- 注册 `ExternalNode`，将自定义结构类型接入 OBNT。

了解更多 → [Modeling (OBNT)](/docs/modeling)

## 编译式 API {#enjoy-compiled-apis}

SJF4J 通过注解接口，在编译期生成优化后的 Java 实现：

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

直接使用生成的实现：

```java
UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);
```

也可以将其注入为 Spring Bean：

```java
@Service
class UserService {
    @Autowired
    private UserNavigator navigator;
}
```

生成机制请参阅 [Compiled APIs](/docs/compiled)，Spring 配置请参阅 [Spring Integration](/docs/spring-integration)。

## 性能测试 {#benchmarks}

SJF4J 通过 [JMH](https://github.com/openjdk/jmh) 基准测试和独立对比评估性能与标准兼容性。

**JSON Binding**
- [Binding Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding.md) — 原生 JSON 后端与 Runtime、Compiled 的对比。
- [Binding Native Image Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding-native.md) — GraalVM AOT 环境下，原生库绑定与 Runtime、Compiled 的对比。
- [🔗 Java JSON Benchmark](https://github.com/fabienrenaud/java-json-benchmark) — 独立的 JSON 库基准测试。

**JSONPath Navigation**
- [JSONPath Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/path.md) — Jayway JsonPath 与 Runtime、Compiled 的对比。
- [🔗 JSONPath Comparison](https://cburgmer.github.io/json-path-comparison/) — 不同实现的规范兼容性对比。

**JSON Schema Validation**
- [JSON Schema Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/schema.md) — NetworkNT 与 Runtime、Compiled 的对比，包括往返处理性能。
- [🔗 Creek Service](https://www.creekservice.org/json-schema-validation-comparison/) — 独立的 JVM 校验基准测试。
- [🔗 Bowtie](https://bowtie.report/) — 跨语言 JSON Schema 标准兼容性测试。

**Object Mapping**
- [Object Mapping Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/mapping.md) — MapStruct 与 CompiledMapper 的对比。
- [🔗 Java Object Mapper Benchmark](https://github.com/arey/java-object-mapper-benchmark) — 独立的 Java 对象映射框架比较。

**JDBC Result Mapping**
- [JDBC Mapping Full Benchmarks](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/jdbc-mapping.md) — Spring JDBC、MyBatis 与 CompiledJdbcMapper 的对比。

了解更多 → [Benchmarks](/docs/benchmarks)

## 参与贡献 {#contributing}

SJF4J 是面向 Java 社区的开源项目，欢迎通过 [Issue](https://github.com/sjf4j-projects/sjf4j/issues/new) 或 Pull Request 参与贡献。
