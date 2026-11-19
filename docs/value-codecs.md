---
title: "Value Codecs"
description: "Define, register, and discover SJF4J value codecs for domain-specific Java types, named formats, and compiled binding."
---

# Value Codecs

A `ValueCodec<V, R>` converts a domain value `V` to and from a JSON-compatible raw representation `R`. In OBNT, the domain object remains a **logical value node**, even when its raw representation is a Map or List.

SJF4J includes codecs for types such as `UUID`, `URI`, `Instant`, and `LocalDate`. Use custom codecs when you cannot annotate the Java value class or need more than one representation.

## Declare a Codec Registry

Declare codecs as public static no-argument factory methods in a `@ValueCodecRegistry` class. The return type identifies the domain and raw types; **individual methods need no annotation**.

```java
public final class OrderId {
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

Register the holder once during application startup, **before SJF4J analyzes the type**:

```java
ValueRegistry.registerAnnotated(AppCodecs.class);

Sjf4j sjf4j = new Sjf4j();
OrderId id = sjf4j.fromJson("\"A-42\"", OrderId.class);
String json = sjf4j.toJsonString(id); // "A-42"
```

The registration is idempotent for the same holder. Public static final `ValueCodec<V, R>` fields are also supported; factory methods are generally simpler.

For a type you own, the alternative is to annotate the value class itself with `@NodeValue`, `@ValueToRaw`, and `@RawToValue`. See [Modeling (OBNT)](/docs/modeling#custom-value-types).

## Named Formats

Use `@NodeValue` on a factory method only when additional format metadata is needed:

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

Select a representation per property or for an entire `Sjf4j` instance:

```java
class Purchase {
    @NodeProperty(valueFormat = "prefixed")
    public OrderId orderId;
}

Sjf4j sjf4j = Sjf4j.builder()
    .valueFormat(OrderId.class, "prefixed")
    .build();
```

One codec without a format name serves as the default. For named-only codecs, use `@NodeValue(format = "...", defaultCodec = true)` to select a default explicitly. Duplicate formats and multiple defaults within one holder are rejected.

## Automatic Registration with ServiceLoader

For reusable extension modules, implement the marker interface `ValueCodecProvider` on the registry class:

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

Then provide this service descriptor:

```text
# src/main/resources/META-INF/services/org.sjf4j.value.ValueCodecProvider
com.example.AppCodecs
```

SJF4J discovers provider classes through Java `ServiceLoader` and registers their codec declarations using the same `ValueRegistry.registerAnnotated()` validation path. With SPI registration, no explicit startup call is necessary. Providers need an accessible no-argument constructor.

Both manual and automatic registration share one global registry. A holder discovered through SPI can also be registered explicitly without duplication. Conflicting formats declared by different holders still fail.

## Compiled Binding

The annotation processor discovers `@ValueCodecRegistry` holders in the **current compilation** automatically, including unannotated static factory methods. When a registry lives in a precompiled dependency, expose it explicitly:

```java
@BindingOptions(registries = AppCodecs.class)
@CompiledBinder
interface OrderBinder {
    @Read OrderId read(String json);
    @Write String write(OrderId value);
}
```

Compile-time discovery reads declarations; it does **not** run factories or register runtime codecs. The codec still needs to be registered by `ValueRegistry.registerAnnotated()` or `ServiceLoader` before a generated implementation uses it.

## Raw Values and Streaming

A codec may declare a raw `String`, numeric type, `Boolean`, `Map`, or `List`—not `Object`. Map values should use `Map<String, Object>`; SJF4J does not recursively bind typed Map contents at the codec boundary. For mutable logical values, override `valueCopy()` to define copy semantics.

For specialized parsing and writing without intermediate raw conversion, use `ValueCodec.StreamingValueCodec`. The ordinary `valueToRaw()` and `rawToValue()` contract remains available.

**API Reference:** [ValueCodec](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodec.html) · [ValueRegistry](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueRegistry.html) · [ValueCodecProvider](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodecProvider.html)
