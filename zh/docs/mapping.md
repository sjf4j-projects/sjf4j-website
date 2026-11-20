---
title: "对象映射"
description: "通过 Runtime API 或生成的 CompiledMapper 实现转换 Java 对象图。"
translationSourceSha: "7640903eb551155be748772b25015ee091465913"
---

# 对象映射 {#object-mapping}

SJF4J 支持在 POJO、record、Map、集合以及 JSON 风格节点之间进行映射。对于灵活的转换，使用 **Runtime API**；对于类型已知的映射，使用 **Compiled Mapper** 生成专用 Java 代码。

## Runtime Mapping {#runtime-mapping}

`Sjf4j.convert()` 无需序列化即可转换受支持的 Java 结构：

```java
Map<String, Object> data = new HashMap<>();
data.put("name", "Alice");
data.put("age", 30);

UserDto dto = new Sjf4j().convert(data, UserDto.class);
```

Runtime 转换也支持嵌套模型，以及通过 `TypeReference<T>` 表示的泛型集合。兼容的值可能会直接复用引用；如需对受支持的结构进行递归复制，请使用 `deepConvert()`。

## Compiled Mapping {#compiled-mapping}

`@CompiledMapper` 在注解处理阶段生成实现。同名属性会自动映射。

以下示例使用这些 Java 类：

```java
class User {
    public String name;
    public int age;
    public Address address;
}

class Address {
    public String city;
}

class UserDto {
    public String name;
    public int age;
    public String displayName;
    public String city;

    public UserDto() {}
}
```

### 自动映射与显式映射 {#automatic-and-explicit-mappings}

```java
@CompiledMapper
interface UserMapper {
    UserDto toDto(User user);

    @Mapping(target = "displayName", source = "name")
    @Mapping(target = "city", source = "$.address.city")
    UserDto toView(User user);
}

UserMapper mapper = CompiledInstances.create(UserMapper.class);
UserDto dto = mapper.toView(user);
```

`toDto()` 按约定映射 `name` 和 `age`。`toView()` 还会填充 `displayName`，并通过 JSONPath 读取 `city`。

通过 `@Mapping` 可以重命名、忽略属性或计算字段。生成代码直接使用普通 Java 属性和构造器访问，不经过 JSON 转换。

在 Spring Framework 和 Spring Boot 中，可以直接注入Compiled Mapper，也可以让它实现 Spring 的 `Converter<S, T>` 接口。参阅 [Spring Integration](/docs/spring-integration#spring-converter)。

## 结构化映射 {#structural-mapping}

Compiled Mapper 可以在 Java 和 JSON 风格的数据表示之间转换：

```java
@CompiledMapper
interface StructuralMapper {
    UserDto fromMap(Map<String, Object> source);
    UserDto fromJsonObject(JsonObject source);

    Map<String, Object> toMap(User source);
    List<UserDto> toDtos(List<User> source);
}
```

嵌套模型、类型化集合及受支持的 [External Nodes](/docs/external-nodes) 都可以参与映射。源端映射不仅支持属性名，也支持 JSONPath 或 JSON Pointer。

对于嵌套的**目标端**路径，`@Mapping` 要求中间父节点已存在；`@EnsureMapping` 可以创建缺失的父节点，`@MappingIfParentPresent` 则会在最终父节点缺失时跳过写入。

## 更新对象 {#updating-objects}

返回类型为 `void` 的 Mapper 方法可以更新已有目标：

```java
@CompiledMapper
interface UserUpdater {
    @MappingOptions(nulls = NullValuePolicy.IGNORE)
    void update(UserDto target, User source);
}

UserUpdater updater = CompiledInstances.create(UserUpdater.class);
updater.update(dto, user);
```

默认情况下，源对象中的 null 属性会覆盖目标值；`NullValuePolicy.IGNORE` 则保留目标原值。如果源对象参数全部为 null，更新操作不执行任何修改；但当需要写入时，null 目标可能导致异常。

`ArrayPolicy` 与 `ObjectPolicy` 控制集合和 Map 的更新方式，包括替换已有值或合并条目。

## 高级特性 {#advanced-features}

| 功能 | API |
| --- | --- |
| 计算属性 | `@Mapping(sources = ..., compute = ...)` |
| 指定优先使用的转换方法 | `@MappingOptions(converters = ...)` |
| 自定义目标对象构造 | `@MappingCreator` |
| 动态类型原始值 | `@MappingOptions(raws = RawPolicy.STRICT / CAST / LENIENT)` |
| null、集合和 Map 更新 | `@MappingOptions` |
| 受支持的多态映射 | `@OneOf` |

Compiled Mapping 支持类型安全的枚举转换，以及部分 `@NodeValue` / `ValueCodec` 转换。它根据声明的源、目标类型生成代码，也存在编译期限制；不能视为所有 Runtime 转换的直接替代品。

准确的方法签名与约束请参考下方 API 文档。

## 性能 {#performance}

在常规 POJO 映射场景下，`@CompiledMapper` 的性能通常能够与 MapStruct 相媲美，同时还支持混合 Java/JSON 风格结构。实际结果取决于工作负载。

性能数据参阅 [Object Mapping Benchmarks](/docs/benchmarks#object-mapping) 和[完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/mapping.md)。这些测试衡量的是对象映射，**不包括 JSON 数据绑定或 JDBC 映射**。

**API 参考（最新发布版本）：** [Sjf4j](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/Sjf4j.html) · [@CompiledMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/CompiledMapper.html) · [@Mapping](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/Mapping.html) · [@MappingOptions](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/MappingOptions.html)
