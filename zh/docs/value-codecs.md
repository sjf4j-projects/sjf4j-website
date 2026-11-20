---
title: "Value Codecs"
description: "为业务 Java 类型定义、注册和发现 SJF4J ValueCodec，支持命名格式和 Compiled Binding。"
translationSourceSha: "7a3673b2d0ce981553f538745900d59bfc40b586"
---

# Value Codecs {#value-codecs}

**对于你能修改的类型，优先使用 `@NodeValue`**，配合 `@ValueToRaw` 和 `@RawToValue` 方法。对于第三方库的类型，或者不希望修改类型定义的场景，可以使用 `ValueCodec<V, R>`。基于注解的方式见 [Modeling (OBNT)](/docs/modeling#custom-value-types)。

Codec 负责在 Java 值 `V` 与兼容 JSON 的原始值 `R` 之间转换。在 OBNT 中，即使原始表示是 Map 或 List，业务类型仍属于**Value Node**。SJF4J 内置 `UUID`、`URI`、`Instant`、`LocalDate` 等常见类型的 Codec。

## ValueCodec 接口 {#valuecodec-interface}

`ValueCodec<V, R>` 定义业务值 `V` 与原始表示 `R` 的相互转换。核心契约如下：

```java
public interface ValueCodec<V, R> {
    Class<V> valueClazz();
    Class<R> rawClazz();

    R valueToRaw(V value);
    V rawToValue(R raw);

    default V valueCopy(V value) { return value; }
}
```

`valueClazz()` 指定业务类型；`rawClazz()` 指定与 JSON 兼容的原始类型（`String`、`Number`、`Boolean`、`Map` 或 `List`）。两个转换方法分别用于写入和读取，`null` 表示 JSON null。对于可变值，应重写 `valueCopy()`。简单的转换可以使用 `ValueCodec.SimpleValueCodec`，通过编码和解码函数实现。

## 声明 Codec Registry {#declare-a-codec-registry}

在标注 `@ValueCodecRegistry` 的类中，将 Codec 声明为 **public static 无参工厂方法**。返回类型用于确定业务类型和原始类型；**各个方法不需要单独标注注解**。工厂方法必须为 static，因为 SJF4J 从 Registry 类型发现它们，不会创建 Registry 实例。

```java
// Example of an existing type whose definition must remain unchanged.
final class OrderId {
    public final String value;

    public OrderId(String value) {
        this.value = value;
    }
}

@ValueCodecRegistry
public final class AppCodecs {

    public static ValueCodec<OrderId, String> orderId() {
        return new ValueCodec.SimpleValueCodec<>(
            OrderId.class, String.class,
            id -> id.value, OrderId::new);
    }
}
```

应在应用启动时、**SJF4J 开始分析对应类型之前**，注册一次 Registry：

```java
ValueRegistry.registerAnnotated(AppCodecs.class);

Sjf4j sjf4j = new Sjf4j();
OrderId id = sjf4j.fromJson("\"A-42\"", OrderId.class);
String json = sjf4j.toJsonString(id); // "A-42"
```

同一个 Registry 重复注册是幂等的。也支持 `public static final ValueCodec<V, R>` 字段；通常工厂方法更简洁。

Registry 也可以是包含 static Codec 工厂方法的**接口**。`ValueRegistry.registerAnnotated(SomeCodecs.class)` 和 APT 都支持这种接口形式，但 **ServiceLoader 不支持**：自动发现必须使用具体类。

## 命名格式 {#named-formats}

仅在需要额外格式元数据时，才在工厂方法上使用 `@NodeValue`：

```java
@ValueCodecRegistry
public final class AppCodecs {
    public static ValueCodec<OrderId, String> orderId() {
        return new ValueCodec.SimpleValueCodec<>(
            OrderId.class, String.class,
            id -> id.value, OrderId::new);
    }

    @NodeValue(format = "prefixed")
    public static ValueCodec<OrderId, String> prefixed() {
        return new ValueCodec.SimpleValueCodec<>(
            OrderId.class, String.class,
            id -> "ord:" + id.value,
            raw -> new OrderId(raw.substring(4)));
    }
}
```

可以按属性指定表示方式，也可以为整个 `Sjf4j` 实例设置：

```java
class Purchase {
    @NodeProperty(valueFormat = "prefixed")
    public OrderId orderId;
}

Sjf4j sjf4j = Sjf4j.builder()
    .valueFormat(OrderId.class, "prefixed")
    .build();
```

没有格式名的 Codec 可以作为默认实现。对于只有命名格式的 Codec，可使用 `@NodeValue(format = "...", defaultCodec = true)` 显式指定默认实现。单个 Registry 内重复的格式或多个默认 Codec 都会被拒绝。

## 通过 SPI 注册 {#registration-via-spi}

对于可复用的扩展模块，让具体 Registry 类实现**空标记接口** `ValueCodecProvider`。显式注册不要求该接口，但 `ServiceLoader` 自动发现必须实现它：

```java
@ValueCodecRegistry
public final class AppCodecs implements ValueCodecProvider {
    public AppCodecs() {}

    public static ValueCodec<OrderId, String> orderId() {
        return new ValueCodec.SimpleValueCodec<>(
            OrderId.class, String.class,
            id -> id.value, OrderId::new);
    }
}
```

然后创建服务描述文件：

```text
# src/main/resources/META-INF/services/org.sjf4j.value.ValueCodecProvider
com.example.AppCodecs
```

SJF4J 通过 Java `ServiceLoader` 发现 Provider 类，并使用与 `ValueRegistry.registerAnnotated()` 相同的校验流程注册其 Codec 声明。使用 SPI 后，不需要额外调用启动注册方法。Provider 必须具有 **public 无参构造器**；Java 8 的 `ServiceLoader` 无法实例化接口。即使 Registry 实现了 `ValueCodecProvider`，Codec 工厂方法仍应为 static。

手动注册和自动发现共用一个全局 Registry。通过 SPI 发现的 holder 仍可以显式注册而不会重复；但不同 holder 声明冲突的格式仍会失败。

## Compiled Binding {#compiled-binding}

注解处理器会自动发现**当前编译过程**中的 `@ValueCodecRegistry`，包括没有注解的 static 工厂方法。对于已经编译成依赖库的 Registry，需要显式声明：

```java
@BindingOptions(registries = AppCodecs.class)
@CompiledBinder
interface OrderBinder {
    @Read OrderId read(String json);
    @Write String write(OrderId value);
}
```

编译时发现只读取声明，**不会执行工厂方法，也不会注册 Runtime Codec**。生成的实现要使用 Codec，仍需事先通过 `ValueRegistry.registerAnnotated()` 或 `ServiceLoader` 注册。

## 原始值与流式处理 {#raw-values-and-streaming}

Codec 可以将 `String`、数字类型、`Boolean`、`Map` 或 `List` 声明为原始类型，**不能使用 `Object`**。Map 的值应使用 `Map<String, Object>`；SJF4J 不会在 Codec 边界递归绑定已带具体类型的 Map 内容。对于可变的逻辑值，应重写 `valueCopy()` 定义复制语义。

若希望在解析和写入时跳过中间原始值转换，可使用 `ValueCodec.StreamingValueCodec`。普通的 `valueToRaw()` 与 `rawToValue()` 契约仍然可用。

**API 参考：** [ValueCodec](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodec.html) · [ValueRegistry](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueRegistry.html) · [ValueCodecProvider](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodecProvider.html)
