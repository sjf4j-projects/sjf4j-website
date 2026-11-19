---
title: "Binding"
description: "Read and write JSON, YAML, and Java Properties with runtime and compiled APIs, multiple backends, and extensible Java object binding."
---

# Binding

SJF4J provides a unified API for reading and writing **JSON, YAML, and Java Properties**. Bind data to ordinary Java objects, Maps, Lists, and other supported models—without requiring an intermediate JSON tree.

Choose flexible **Runtime Binding** or generate specialized readers and writers with **Compiled Binding**.

## Runtime Binding

### Basic usage

Use `Sjf4j` to work with the same Java model across formats:

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

No base class or binding annotation is required for a regular POJO. YAML binding requires the SnakeYAML backend; JSON and Properties work with the built-in implementations.

### Generic types and streams

`TypeReference` preserves generic target types. JSON also supports direct stream I/O:

```java
List<User> users = sjf4j.fromJson(
    json,
    new TypeReference<List<User>>() {}
);

User user = sjf4j.fromJson(inputStream, User.class);
sjf4j.toJson(outputStream, user);
```

For JSON, inputs can be `String`, `byte[]`, `Reader`, or `InputStream`; outputs can be `String`, `byte[]`, `Writer`, or `OutputStream`. YAML offers text and character-stream binding, while Java Properties uses `Properties` objects.

## Compiled Binding

`@CompiledBinder` generates type-specific readers and writers during annotation processing. It uses the same Java object model as Runtime Binding, with generated code specialized for the declared types and selected backend.

### Define a binder

```java
@CompiledBinder
interface UserBinder {
    @Read User read(String json);
    @Read User readBytes(byte[] json);

    @Write String write(User user);
    @Write byte[] writeBytes(User user);
}
```

### Use the generated implementation

```java
UserBinder binder = CompiledInstances.create(UserBinder.class);

User user = binder.read(json);
byte[] output = binder.writeBytes(user);
```

The generated implementation is named `UserBinder_Impl`. Read methods also accept `Reader` and `InputStream`; write methods can write to `Writer` or `OutputStream`.

The format and backend are fixed for each compiled binder interface:

- `@CompiledBinder(backend = Backend.JACKSON2)` explicitly selects Jackson 2 for JSON.
- `@CompiledBinder(format = Format.YAML, backend = Backend.SNAKE)` selects SnakeYAML for YAML.

The default `Backend.AUTO` resolves a usable backend at **compile time**, which can differ from runtime provider selection. Compiled Binding supports **JSON and YAML**; Java Properties binding is runtime-only.

For annotation processor setup and generated source locations, see [Installation](/docs/installation) and [Compiled APIs](/docs/compiled).

## Object Binding

SJF4J binds both conventional Java types and its extensible object models:

| Model | Supported representations |
| --- | --- |
| Java objects | POJOs, Java records, constructors and factory-created objects |
| Collections | `Map`, `List`, arrays, and supported collections |
| JSON containers | `JsonObject`, `JsonArray`, JOJO, and JAJO |
| Logical values | Enums, built-in scalar types, and custom `@NodeValue` types |

### Property rules

Use `@NodeObject` for type-level rules and `@NodeProperty` for individual properties:

```java
@NodeObject(naming = NamingStrategy.SNAKE_CASE)
class Account {
    @NodeProperty(aliases = {"username"})
    public String userName;

    public String displayName;
}
```

Here, `userName` and `displayName` bind to `user_name` and `display_name`; `username` is also accepted when reading.

For more control, `@NodeCreator` selects a constructor or factory method, and `@NodeObject.propertyStrategy` controls field/bean property discovery. JOJOs can retain undeclared fields alongside typed properties, with `readDynamic` and `writeDynamic` controlling that behavior.

Learn more in [Modeling (OBNT)](/docs/modeling).

## Polymorphic Binding

`@OneOf` selects a concrete subtype when reading polymorphic values. It supports three selection strategies in Runtime and Compiled Binding.

### Discriminator key

Choose a subtype by a property in the current JSON object:

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

### Discriminator path

Use `discriminatorPath` when the discriminator is nested. The JSONPath is evaluated against the value being selected:

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

### JSON type

Omit the discriminator to select by `JsonType` (JSON shape). Each subtype must have a distinct shape:

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

For fields, `scope = OneOf.Scope.PARENT` reads a `discriminatorKey` from the containing object instead of the value; it does not support `discriminatorPath`. Key and path discriminators are mutually exclusive, and path selection requires `CURRENT` scope. Unmatched values fail by default; use `onNoMatch = OneOf.OnNoMatch.RETURN_NULL` to return null instead. See [`@OneOf`](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/annotation/node/OneOf.java) for nesting and creator-parameter restrictions.

## Value Codecs

SJF4J includes codecs for `UUID`, `URI`, `Instant`, `LocalDate`, and other common values. Customize a value's representation with `@NodeProperty`:

```java
class EventRecord {
    @NodeProperty(valueFormat = "epochMillis")
    public Instant timestamp;

    @NodeProperty(valuePattern = "dd/MM/yyyy")
    public LocalDate date;
}
```

To define domain-specific values, use `@NodeValue` on a value class or declare a `ValueCodec<V, R>` in a `@ValueCodecRegistry` class. See [Value Codecs](/docs/value-codecs) for custom factories, named formats, registration, `ServiceLoader`, and Compiled Binding support.

## Backends and Streaming

SJF4J's binding semantics are independent of the underlying JSON/YAML library. Backends supply streaming parsers and generators; SJF4J handles Java object binding.

See [Backends & Formats](/docs/backends) for supported libraries, selection rules, and the [complete backend integration guide](/docs/backends#adding-a-backend). For third-party in-memory JSON trees, see [External Nodes](/docs/external-nodes).


## Configuration

Use `Sjf4j.builder()` to configure an instance and inject a native backend. For example, enable comments in Jackson 2's streaming parser:

```java
JsonFactory factory = new JsonFactory()
    .enable(JsonParser.Feature.ALLOW_COMMENTS);

Sjf4j sjf4j = Sjf4j.builder()
    .jsonProvider(Jackson2BinderProvider.of(factory))
    .includeNulls(false)
    .valueFormat(Instant.class, "epochMillis")
    .build();
```

`JsonFactory` controls Jackson's streaming parser and generator settings. The supplied factory is reused and adjusted in place by the binder (including charset detection and auto-close settings), so configure it before building the `Sjf4j` instance. This configuration does not change `Sjf4j.global()`.

### Binding compatibility

**SJF4J has its own binding contract**, even when using a native library's streaming backend. It is **not a drop-in replacement** for Jackson Databind or other object mappers.

SJF4J recognizes a limited set of third-party annotations:

| Library | Runtime Binding support |
| --- | --- |
| Jackson 2/3 | `@JsonProperty` (name), `@JsonAlias` (aliases), `@JsonCreator` (constructor/factory) |
| Fastjson2 | `@JSONField` (`name`, `alternateNames`), `@JSONCreator` (constructor/factory) |

**Compiled Binding** recognizes Jackson 2 `@JsonProperty`, `@JsonAlias`, `@JsonCreator`; Jackson 3 `@JsonProperty`; and Fastjson2 `@JSONField(name)`. SJF4J's `@NodeProperty` takes precedence.

Other annotations (such as `@JsonIgnore`, `@JsonInclude`, `@JsonTypeInfo`), `ObjectMapper` modules, and custom Jackson serializers are not applied. Before replacing an existing mapper, check property names, null handling, polymorphism, value formats, and round-trip results.

For **Compiled Binding**, explicitly pass the configured backend binder when creating an implementation whose `@CompiledBinder` backend is `Backend.JACKSON2`:

```java
UserBinder binder = CompiledInstances.create(
    UserBinder.class, sjf4j.jsonBinder());
```

The generated binder's backend must match the supplied binder; creating it with `CompiledInstances.create(UserBinder.class)` does not inherit the `Sjf4j` instance's configuration.

## Performance

Compiled Binding generates specialized Java code to reduce runtime metadata lookup and generic dispatch. Performance depends on the backend, object model, and workload.

See the measurements and methodology in [Binding on the JVM](/docs/benchmarks#data-binding-on-the-jvm) and [Binding on GraalVM Native Image](/docs/benchmarks#binding-on-graalvm-native-image).

**API Reference (latest release):** [Sjf4j](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/Sjf4j.html) · [@CompiledBinder](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/binding/CompiledBinder.html) · [ValueCodec](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/value/ValueCodec.html)
