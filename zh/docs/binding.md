---
title: "数据绑定"
description: "通过运行时或 Compiled API 读写 JSON、YAML 和 Java Properties，使用多种后端并扩展 Java 对象绑定能力。"
translationSourceSha: "a2dc2d4eadfc604a2af52ba97fd59dbb0c5f2f80"
---

# 数据绑定 {#binding}

SJF4J 使用统一 API 读写 **JSON、YAML 和 Java Properties**。可以直接将数据绑定到普通 Java 对象、Map、List 等受支持的模型，**无需中间 JSON 树**。

你可以使用灵活的 **Runtime Binding**，也可以通过 **Compiled Binding** 生成专用的读写代码。

## Runtime Binding {#runtime-binding}

### 基本用法 {#basic-usage}

使用 `Sjf4j`，以同一套 Java 模型处理不同格式：

```java
class User {
    public String name;
}

Sjf4j sjf4j = new Sjf4j();

// JSON → POJO
User user = sjf4j.fromJson("{\"name\":\"Alice\"}", User.class);

// POJO → JSON / YAML / Properties
String json = sjf4j.toJsonString(user);
String yaml = sjf4j.toYamlString(user);
Properties props = sjf4j.toProperties(user);

// Properties → POJO
User restored = sjf4j.fromProperties(props, User.class);
```

普通 POJO 不需要继承基类，也不必添加绑定注解。YAML 绑定需要 SnakeYAML 后端；JSON 和 Properties 可以使用内置实现。

### 泛型与流 {#generic-types-and-streams}

`TypeReference` 保留泛型目标类型信息。JSON 也支持直接读写流：

```java
List<User> users = sjf4j.fromJson(
    json,
    new TypeReference<List<User>>() {}
);

User user = sjf4j.fromJson(inputStream, User.class);
sjf4j.toJson(outputStream, user);
```

JSON 输入可使用 `String`、`byte[]`、`Reader` 或 `InputStream`，输出可使用 `String`、`byte[]`、`Writer` 或 `OutputStream`。YAML 支持文本和字符流绑定；Java Properties 则使用 `Properties` 对象。

## Compiled Binding {#compiled-binding}

`@CompiledBinder` 在注解处理阶段生成针对目标类型的读取和写入方法。它与 Runtime Binding 使用同一套 Java 对象模型，生成代码针对声明的类型和所选后端进行专门优化。

### 定义 Binder {#define-a-binder}

```java
@CompiledBinder
interface UserBinder {
    @Read User read(String json);
    @Read User readBytes(byte[] json);

    @Write String write(User user);
    @Write byte[] writeBytes(User user);
}
```

### 使用生成的实现 {#use-the-generated-implementation}

```java
UserBinder binder = CompiledInstances.create(UserBinder.class);

User user = binder.read(json);
byte[] output = binder.writeBytes(user);
```

生成类名为 `UserBinder_Impl`。读取方法也支持 `Reader` 和 `InputStream`；写入方法可将内容输出到 `Writer` 或 `OutputStream`。

每个 Compiled Binder 接口的格式和后端是固定的：

- `@CompiledBinder(backend = Backend.JACKSON2)` 明确使用 Jackson 2 处理 JSON。
- `@CompiledBinder(format = Format.YAML, backend = Backend.SNAKE)` 使用 SnakeYAML 处理 YAML。

默认的 `Backend.AUTO` 在**编译期**选择可用后端，可能与运行时提供者的选择不同。Compiled Binding 支持 **JSON 和 YAML**；Java Properties 仅支持 Runtime Binding。

使用 `@CompiledBinder(includeNulls = false)` 设置默认忽略值为 null 的 Object 成员。单个方法可通过显式指定 `@Write(includeNulls = true)` 或 `@Write(includeNulls = false)` 覆盖这一策略。根节点的 null 值和 Array 中的 null 元素始终写出。

注解处理器配置与生成源码位置参阅 [Installation](/docs/installation) 和 [Compiled APIs](/docs/compiled)。

## Java 对象绑定 {#object-binding}

SJF4J 同时支持常规 Java 类型与可扩展的对象模型：

| 模型 | 支持的表示 |
| --- | --- |
| Java 对象 | POJO、Java record、通过构造器或工厂方法创建的对象 |
| 集合 | `Map`、`List`、数组及受支持的集合 |
| JSON 容器 | `JsonObject`、`JsonArray`、JOJO 和 JAJO |
| 逻辑值 | 枚举、内置标量类型及自定义 `@NodeValue` 类型 |

### 属性规则 {#property-rules}

使用 `@NodeObject` 配置类型级规则，使用 `@NodeProperty` 配置单个属性：

```java
@NodeObject(naming = NamingStrategy.SNAKE_CASE)
class Account {
    @NodeProperty(aliases = {"username"})
    public String userName;

    public String displayName;
}
```

这里 `userName` 和 `displayName` 分别绑定到 `user_name` 和 `display_name`；读取时也接受别名 `username`。

如果需要更多控制，可以使用 `@NodeCreator` 指定构造器或工厂方法，并通过 `@NodeObject.propertyStrategy` 控制字段或 JavaBean 属性发现。JOJO 允许在类型化属性之外保留未声明的动态字段，并通过 `readDynamic` 和 `writeDynamic` 控制相关行为。

详见 [Modeling (OBNT)](/docs/modeling)。

## 多态绑定 {#polymorphic-binding}

`@OneOf` 在读取多态值时决定使用哪个具体子类型。Runtime 和 Compiled Binding 都支持以下三类选择方式。

### 按判别字段选择 {#discriminator-key}

通过当前 JSON 对象中的字段选择子类型：

```java
@OneOf(discriminatorKey = "type", cases = {
    @OneOfCase(type = Login.class, when = "login"),
    @OneOfCase(type = Logout.class, when = "logout")
})
abstract class Event {
    public String type;
}

class Login extends Event {
    public String user;
}

class Logout extends Event {
    public String reason;
}

// {"type":"login","user":"Alice"} → Login
```

### 按判别路径选择 {#discriminator-path}

判别信息嵌套在对象内部时，使用 `discriminatorPath`。JSONPath 相对于**待选择的值**求值：

```java
class Envelope {
    @OneOf(discriminatorPath = "$.meta.kind", cases = {
        @OneOfCase(type = Login.class, when = "login"),
        @OneOfCase(type = Logout.class, when = "logout")
    })
    public Event payload;
}

// {"payload":{"meta":{"kind":"login"},"user":"Alice"}} → Login
```

### 按 JSON 类型选择 {#json-type}

不提供判别字段时，可根据 `JsonType`（JSON 形态）选择。每个子类型必须对应不同的 JSON 形态：

```java
class ValueHolder {
    @OneOf(cases = {
        @OneOfCase(type = String.class),
        @OneOfCase(type = Integer.class)
    })
    public Object value;
}

// {"value":"hello"} → String
// {"value":42}      → Integer
```

对于字段，`scope = OneOf.Scope.PARENT` 可从包含该字段的父对象中读取 `discriminatorKey`，但不支持 `discriminatorPath`。`discriminatorKey` 与 `discriminatorPath` 不能同时使用；路径判别要求 `CURRENT` 作用域。

默认情况下，无法匹配的值会导致失败；可以指定 `onNoMatch = OneOf.OnNoMatch.RETURN_NULL` 返回 null。嵌套多态与创建器参数有额外限制，详见 [`@OneOf`](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/annotation/node/OneOf.java)。

## ValueCodec {#value-codecs}

SJF4J 内置了 `UUID`、`URI`、`Instant`、`LocalDate` 等常用值类型的编解码器。可以通过 `@NodeProperty` 自定义值的表示：

```java
class EventRecord {
    @NodeProperty(valueFormat = "epochMillis")
    public Instant timestamp;

    @NodeProperty(valuePattern = "dd/MM/yyyy")
    public LocalDate date;
}
```

若要定义业务值类型，可以在类上使用 `@NodeValue`，或在 `@ValueCodecRegistry` 中声明 `ValueCodec<V, R>`。自定义工厂、命名格式、注册、`ServiceLoader` 以及 Compiled Binding 支持方式，请参阅 [Value Codecs](/docs/value-codecs)。

## 后端与流式处理 {#backends-and-streaming}

SJF4J 的绑定语义独立于底层 JSON/YAML 库。后端提供流式 Parser 和 Generator，Java 对象的绑定行为由 SJF4J 负责。

支持的第三方库、后端选择规则及[完整的后端扩展指南](/docs/backends#adding-a-backend)，参阅 [Backends & Formats](/docs/backends)。第三方内存 JSON 树的集成请参阅 [External Nodes](/docs/external-nodes)。

## 配置 {#configuration}

使用 `Sjf4j.builder()` 配置实例，并注入原生后端。例如，启用 Jackson 2 流式解析器的注释支持：

```java
JsonFactory factory = new JsonFactory()
    .enable(JsonParser.Feature.ALLOW_COMMENTS);

Sjf4j sjf4j = Sjf4j.builder()
    .jsonProvider(Jackson2BinderProvider.of(factory))
    .includeNulls(false)
    .valueFormat(Instant.class, "epochMillis")
    .build();
```

`JsonFactory` 控制 Jackson 流式 Parser 和 Generator 的配置。Binder 会复用并**原地调整**传入的工厂（包括字符集检测和自动关闭设置），因此应在构建 `Sjf4j` 实例之前完成配置。该设置不会修改 `Sjf4j.global()`。

### 绑定兼容性 {#binding-compatibility}

**SJF4J 有自己的绑定契约。** 即使底层使用第三方库的流式后端，它也**不是 Jackson Databind 或其他对象映射器的直接替代品**。

SJF4J 只识别有限范围的第三方注解：

| 库 | Runtime Binding 支持 |
| --- | --- |
| Jackson 2/3 | `@JsonProperty`（属性名）、`@JsonAlias`（别名）、`@JsonCreator`（构造器或工厂方法） |
| Fastjson2 | `@JSONField`（`name`、`alternateNames`）、`@JSONCreator`（构造器或工厂方法） |

**Compiled Binding** 识别 Jackson 2 的 `@JsonProperty`、`@JsonAlias`、`@JsonCreator`；Jackson 3 的 `@JsonProperty`；以及 Fastjson2 的 `@JSONField(name)`。SJF4J 的 `@NodeProperty` 优先级更高。

其他注解（例如 `@JsonIgnore`、`@JsonInclude`、`@JsonTypeInfo`）、`ObjectMapper` 模块及自定义 Jackson 序列化器不会被应用。替换已有 Mapper 之前，需要检查属性命名、null 处理、多态、值格式以及序列化往返结果。

要定制 **Compiled Binding** 的原生 Parser 和 Generator 配置，可在创建实现时传入与所选后端匹配的 Binder。例如，使用 `Backend.JACKSON2` 时：

```java
UserBinder binder = CompiledInstances.create(
    UserBinder.class, sjf4j.jsonBinder());
```

原生 Parser 和 Generator 的配置来自传入的后端。Compiled Binding 的绑定策略由注解在编译期确定。

## 性能 {#performance}

Compiled Binding 为具体类型生成专用 Java 代码，减少运行时元数据查找和通用分派开销。实际性能取决于后端、对象模型与工作负载。

测试结果和方法参阅 [Binding on the JVM](/docs/benchmarks#data-binding-on-the-jvm) 和 [Binding on GraalVM Native Image](/docs/benchmarks#binding-on-graalvm-native-image)。

**API 参考（最新发布版本）：** [Sjf4j](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/Sjf4j.html) · [@CompiledBinder](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/binding/CompiledBinder.html) · [ValueCodec](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodec.html)
