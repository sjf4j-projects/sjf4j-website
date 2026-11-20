---
title: "编译式 API"
description: "在编译期为数据绑定、对象导航、JSON Schema 校验、对象映射及 JDBC 结果映射生成专用 Java 实现。"
translationSourceSha: "c84b33bc292cd616373211a2f1dda88a54e31c0b"
---

# 编译式 API {#compiled-apis}

**运行时灵活，编译期高效。** SJF4J 可在编译期间将带注解的 Java 接口转换为专用实现。生成的是**普通、可读的 Java 源码**，可以查看、调试，也能由 JVM 优化。

编译式 API 是灵活的 Runtime API 的补充，适合类型信息和表达式在执行之前已确定、操作逻辑相对稳定的场景。

## 工作原理 {#how-it-works}

首先定义一个描述目标操作的接口。SJF4J 的注解处理器会在构建期间分析接口，并生成对应实现。

<CompiledCodeComparison />

*上图中的生成实现只是简化示意，并非注解处理器的逐字输出。* 示例中，`User` 包含一个 `Address address` 属性，`Address` 包含一个 `String city` 属性。

像使用普通 Java API 一样调用接口：

```java
UserNavigator navigator = CompiledInstances.create(UserNavigator.class);
String city = navigator.getCity(user);
```

生成的类名为 `UserNavigator_Impl`。对于模型允许的操作，生成方法可以用直接的 Java 访问代替重复的路径解析和通用分派；某些操作仍需调用 SJF4J 的运行时支持。

整个过程可以概括为：**声明接口 → 编译生成的 Java 代码 → 调用实现**。不需要额外的字节码解释器，也不需要中间 JSON 树。

## 可用的编译式 API {#available-compiled-apis}

统一的编译时模型覆盖五类能力：

| 注解 | 生成能力 | 文档 |
| --- | --- | --- |
| `@CompiledBinder` | 针对指定数据格式和后端的读写方法 | [Binding](/docs/binding) |
| `@CompiledNavigator` | JSONPath 访问、查询和更新 | [Navigating](/docs/navigating) |
| `@CompiledValidator` | 针对静态绑定 JSON Schema 的校验 | [Validating](/docs/validating) |
| `@CompiledMapper` | Java 对象之间的映射和更新 | [Object Mapping](/docs/mapping) |
| `@CompiledJdbcMapper` | JDBC `ResultSet` 到 Java 对象的直接映射 | [JDBC Mapping](/docs/jdbc-mapping) |

每种注解都会为接口生成单独的 `_Impl` 类，但支持的方法签名和编译规则取决于具体能力。

其中，`@CompiledJdbcMapper` 直接映射数据库列，而不是转换已有的 Java 对象图。它还可以利用 `ResultSetMetaData` 准备可复用、无状态的 `JdbcRowMapper<T>`。具体方法和示例参见对应功能文档。

## 快速使用 {#getting-started}

依赖项与注解处理器配置请参阅[安装指南](/docs/installation)。

### 创建与复用实例 {#create-and-reuse-instances}

每次调用 `CompiledInstances.create(...)` 都会创建**新的生成类实例**，不会自动缓存。你可以自己持有实例、通过依赖注入管理，或在接口中声明共享字段：

```java
@CompiledNavigator
interface UserNavigator {
    UserNavigator INSTANCE = CompiledInstances.create(UserNavigator.class);

    @GetByPath("$.address.city")
    String getCity(User user);
}

String city = UserNavigator.INSTANCE.getCity(user);
```

工厂方法还支持传入 `NodeConfig`；编译式 Binder 可以接收预先配置且与所选后端匹配的 Binder。具体配置方式参阅各功能文档。

在 **Spring Framework 6.2+** 中，`sjf4j-spring` 可通过 `@EnableSjf4j` 注册生成接口。**Spring Boot 3.x** 则可以直接使用 Starter，无须额外配置。两者都支持 `@Autowired`，不必手动调用 `CompiledInstances.create()`。参阅 [Spring Integration](/docs/spring-integration)。

### 查看生成源码 {#inspect-generated-source}

生成的 Java 类以接口名加 `_Impl` 结尾，位于标准的注解处理输出目录：

| 构建工具 | 常见生成源码目录 |
| --- | --- |
| Gradle | `build/generated/sources/annotationProcessor/java/main/` |
| Maven | `target/generated-sources/annotations/` |

打开 `UserNavigator_Impl.java` 即可检查实际生成代码。它是普通 Java 源码，可以直接用 IDE 调试。

## Runtime 与 Compiled 的区别 {#runtime-vs-compiled}

根据操作在执行前能够确定多少信息来选择 API：

| | Runtime API | Compiled API |
| --- | --- | --- |
| 定义方式 | 运行时选择和配置 | 通过带注解的接口声明 |
| 表达式与类型 | 可以动态变化 | 必须满足静态编译规则 |
| 执行方式 | 通用结构化处理 | 专用生成 Java 代码 |
| 配置要求 | 无须注解处理器 | 构建时启用注解处理 |
| 适用场景 | 动态、临时性操作 | 稳定、高频的操作 |

两者都操作 SJF4J 的 [OBNT (Object-Based Node Tree)](/docs/modeling)，因此使用编译式 API 并不需要更换 Java 对象模型。

### 编译限制与回退 {#compilation-limits-and-fallback}

**并非所有 Runtime 功能都能生成直接执行的 Java 代码。** 对于不支持的操作，编译器可能给出诊断错误，而不会悄悄改变行为。

Fallback 是**针对具体能力的选项**，不是全局开关。例如：

- `@CompiledNavigator(fallback = true)` 允许部分 `@FindByPath` 过滤器使用运行时求值。
- `@CompiledValidator(fallback = true)` 可以将不支持的 Schema 校验委托给 Runtime `SchemaPlan`；默认值为 `false`，即在编译阶段拒绝不支持的结构。

这并不意味着所有动态表达式或转换都能自动编译或回退。应根据对应功能文档选择 Runtime 或 Compiled 方式。

## 性能 {#performance}

编译式 API 为受支持的操作生成专用 Java 代码，以降低运行时开销。收益随工作负载变化；性能数据与测试方法参阅 [Benchmarks](/docs/benchmarks)。

**API 参考（最新发布版本）：** [CompiledInstances](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/CompiledInstances.html) · [@CompiledNavigator](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/path/CompiledNavigator.html) · [@CompiledMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/CompiledMapper.html) · [@CompiledValidator](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/schema/CompiledValidator.html)
