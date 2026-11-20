---
title: "数据校验"
description: "使用 Runtime 与 Compiled API，直接根据 JSON Schema 校验 Java 对象。"
translationSourceSha: "8c217730b400669a0e2ed5043159a1470403fe4b"
---

# 数据校验 {#validating}

SJF4J 可以直接通过 **JSON Schema** 校验 Java 对象，无需先序列化或构建中间 JSON 树。支持 **Draft 2020-12、2019-09 和 7**，同时提供灵活的 Runtime 校验和编译期生成的校验器。

适用于 POJO、Map、List、SJF4J 节点及受支持的[External Nodes](/docs/external-nodes)。

## 快速开始 {#getting-started}

从普通 Java 对象开始：

```java
class User {
    public String name;
    public int age;
}
```

在 `src/main/resources/schemas/user.json` 中定义 Schema。下面的两种方式都使用该文件：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "description": "A user record",
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}
```

Runtime 校验需要 `sjf4j-schema`；Compiled 校验还需要将 `sjf4j-processor` 加入注解处理器路径。Gradle 和 Maven 配置参阅[安装指南](/docs/installation)。

## Runtime Validation {#runtime-validation}

解析一次 JSON Schema，创建可复用的 `SchemaPlan`，直接校验 Java 对象。这里的 `schemaJson` 包含上面的 JSON Schema：

```java
SchemaPlan plan = JsonSchema.fromJson(schemaJson).createPlan();

User user = new User();
user.name = "Alice";
user.age = 18;

boolean valid = plan.isValid(user);
ValidationResult result = plan.validate(user);
plan.requireValid(user);
```

根据需要选择返回方式：

| API | 行为 |
| --- | --- |
| `isValid(value)` | 快速校验，失败即停止，返回布尔值 |
| `validate(value)` | 收集校验错误 |
| `requireValid(value)` | 校验失败时抛出 `ValidationException` |

### 错误与注解 {#errors-and-annotations}

`ValidationResult` 提供失败的关键字、错误消息、实例位置和 Schema 位置：

```java
user.name = "";

ValidationResult errors = plan.validate(user);
for (ValidationResult.Detail error : errors.getErrors()) {
    System.out.println(error.getKeyword() + ": "
            + error.getInstancePs().rootedPointerExpr()
            + " - " + error.getMessage());
}
```

如需控制失败即停止、严格的 `format` 断言或收集 JSON Schema 注解，可使用 `ValidationOptions`：

```java
user.name = "Alice"; // Restore a valid instance.

ValidationOptions options = ValidationOptions.builder()
        .collectAnnotations(true)
        .build();

ValidationResult annotated = plan.validate(user, options);
annotated.getAnnotations(); // title, description, default, examples, etc.
```

注解收集是可选的。默认情况下，`SchemaPlan` 将 `format` 视为注解而非断言；启用 `strictFormat` 后会校验受支持的格式。

## Compiled Validation {#compiled-validation}

`@CompiledValidator` 在注解处理阶段生成 Java 校验代码。它使用与 Runtime 校验相同的 Schema 和 Java 模型：

```java
@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}

UserValidator validator = CompiledInstances.create(UserValidator.class);
boolean valid = validator.isValid(user);
```

生成实现名为 `UserValidator_Impl`。重复校验时应复用实例；对于支持直接编译的规则，生成代码可避免通用 Schema 求值开销。

### 编译与回退 {#compilation-and-fallback}

默认的 `@CompiledValidator(fallback = false)` 会在**编译期**拒绝不支持的 Schema 结构。如果需要把这些检查交给 Runtime `SchemaPlan`，可以显式启用回退：

```java
@CompiledValidator(fallback = true)
interface UserDiagnostics {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    ValidationResult validate(User user);
}
```

Compiled 方法接受一个待校验值，并可额外接受 `boolean strictFormat` 参数。返回类型决定执行行为：

| 返回类型 | 行为 |
| --- | --- |
| `boolean` | 失败即停止并返回布尔结果 |
| `void` | 校验失败时抛出异常 |
| `ValidationResult` | 通过 Runtime fallback 返回详细结果；要求 `fallback = true` |

常见的类型、对象、数组、字符串、数字和组合规则可以直接编译。部分组合，包括跨 Schema 的复杂 `unevaluated*` 跟踪，仍需要 fallback。

各关键字的覆盖情况、限制和生成行为参阅 [CompiledValidator 参考文档](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/compiled-validator.md)。

## Schema 引用 {#schema-references}

SJF4J 支持 `$ref`、`$defs`、锚点及外部 Schema 引用。创建 Runtime `SchemaPlan` 前，可先使用 `SchemaRegistry` 注册外部文档：

```java
SchemaRegistry registry = new SchemaRegistry();
registry.index(
        URI.create("https://example.org/common"),
        JsonSchema.fromJson("{\"type\":\"string\"}")
);

SchemaPlan plan = JsonSchema.fromJson(
        "{\"$ref\":\"https://example.org/common\"}"
).createPlan(registry);
```

对于基于注解或 Compiled 的校验，`@ValidJsonSchema` 还支持 `externalSchemas`（内联映射）和 `externalSchemasRef`（JSON 映射文件）。例如在 `@CompiledValidator` 接口中：

```java
@ValidJsonSchema(
        ref = "classpath:/schemas/user.json",
        externalSchemasRef = "classpath:/schemas/external.json")
boolean isValid(User user);
```

映射文件将**绝对检索 URI** 与 JSON Schema 文档关联起来，供本地解析外部引用使用。SJF4J **不会自动通过 HTTP 下载远程 Schema**。

对于规模较大的离线 Schema 集，可使用 `externalSchemasRef` 提供 URI 到 Schema 的映射文件。应将 Schema 资源纳入构建输入，让文件变更能够触发注解处理；若启用 Runtime fallback，还需确保运行时能访问映射文件。

## 注解式校验 {#annotation-based-validation}

`@ValidJsonSchema` 也可以直接标注在 Java 类型上，供 **Runtime** 校验使用，无须定义 Compiled 接口：

```java
@ValidJsonSchema(ref = "classpath:/schemas/user.json")
class User {
    public String name;
    public int age;
}

SchemaValidator validator = new SchemaValidator();
validator.requireValid(user);
```

`SchemaValidator` 会解析类型上的注解（包括带注解的父类）、缓存校验计划，并默认执行严格的 `format` 检查。它不同于需要显式提供 Schema 的 `SchemaPlan`。

在 Compiled 校验器中，`@ValidJsonSchema` 也可以标在方法或参数上；方法注解优先于参数和类型注解。

## 标准兼容性与性能 {#compliance-and-performance}

SJF4J 支持 JSON Schema **Draft 2020-12、2019-09 和 7**。兼容性通过[官方 JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) 测试；独立对比资源包括 [Bowtie](https://bowtie.report/) 和 [Creek Service](https://www.creekservice.org/json-schema-validation-comparison/)。

Runtime 校验直接作用于 Java 对象；Compiled 校验可针对稳定 Schema 生成专用实现。性能取决于 Schema 与输入对象表示。数据和测试方法参阅 [JSON Schema Validation Benchmarks](/docs/benchmarks#json-schema-validation) 及[完整测试报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/schema.md)。

**API 参考（最新发布版本）：** [JsonSchema](https://javadoc.io/doc/org.sjf4j/sjf4j-schema/latest/org/sjf4j/schema/JsonSchema.html) · [SchemaPlan](https://javadoc.io/doc/org.sjf4j/sjf4j-schema/latest/org/sjf4j/schema/SchemaPlan.html) · [@CompiledValidator](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/schema/CompiledValidator.html) · [@ValidJsonSchema](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/schema/ValidJsonSchema.html)
