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

~~~java
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
~~~

No base class or binding annotation is required for a regular POJO. YAML binding requires the SnakeYAML backend; JSON and Properties work with the built-in implementations.

### Generic types and streams

`TypeReference` preserves generic target types. JSON also supports direct stream I/O:

~~~java
List<User> users = sjf4j.fromJson(
    json,
    new TypeReference<List<User>>() {}
);

User user = sjf4j.fromJson(inputStream, User.class);
sjf4j.toJson(outputStream, user);
~~~

For JSON, inputs can be `String`, `byte[]`, `Reader`, or `InputStream`; outputs can be `String`, `byte[]`, `Writer`, or `OutputStream`. YAML offers text and character-stream binding, while Java Properties uses `Properties` objects.

## Compiled Binding

`@CompiledBinder` generates type-specific readers and writers during annotation processing. It uses the same Java object model as Runtime Binding, with generated code specialized for the declared types and selected backend.

### Define a binder

~~~java
@CompiledBinder
interface UserBinder {
    @Read User read(String json);
    @Read User readBytes(byte[] json);

    @Write String write(User user);
    @Write byte[] writeBytes(User user);
}
~~~

### Use the generated implementation

~~~java
UserBinder binder = CompiledInstances.create(UserBinder.class);

User user = binder.read(json);
byte[] output = binder.writeBytes(user);
~~~

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

~~~java
@NodeObject(naming = NamingStrategy.SNAKE_CASE)
class Account {
    @NodeProperty(aliases = {"username"})
    public String userName;

    public String displayName;
}
~~~

Here, `userName` and `displayName` bind to `user_name` and `display_name`; `username` is also accepted when reading.

For more control, `@NodeCreator` selects a constructor or factory method, and `@NodeObject.propertyStrategy` controls field/bean property discovery. JOJOs can retain undeclared fields alongside typed properties, with `readDynamic` and `writeDynamic` controlling that behavior.

Learn more in [Modeling (OBNT)](/docs/modeling).

## Polymorphic Binding

`@OneOf` selects a concrete subtype using a discriminator or, for distinct shapes, the input's JSON structure. It works with Runtime and Compiled Binding.

~~~java
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

Event event = sjf4j.fromJson(
    "{\"type\":\"login\",\"user\":\"Alice\"}",
    Event.class
); // Login
~~~

Discriminators can be read from the current object; selected property-level mappings can also use a parent discriminator. Nested polymorphism and creator parameters have additional restrictions. See the `@OneOf` API documentation for those cases.

## Value Codecs

Built-in binding supports common Java values such as `UUID`, `URI`, `Instant`, `LocalDate`, `BigDecimal`, and enums.

### Select a value format

A property can override the default representation:

~~~java
class EventRecord {
    @NodeProperty(valueFormat = "epochMillis")
    public Instant timestamp;

    @NodeProperty(valuePattern = "yyyy-MM-dd")
    public LocalDate date;
}
~~~

Or configure a default format for a `Sjf4j` instance:

~~~java
Sjf4j sjf4j = Sjf4j.builder()
    .valueFormat(Instant.class, "epochMillis")
    .build();
~~~

### Define a custom value type

`@NodeValue` models a domain type as one logical value rather than an object with properties:

~~~java
@NodeValue
public final class UserId {
    private final String value;

    public UserId(String value) {
        this.value = value;
    }

    @ValueToRaw
    public String toRaw() {
        return value;
    }

    @RawToValue
    public static UserId fromRaw(String raw) {
        return raw == null ? null : new UserId(raw);
    }
}
~~~

A `UserId` is now bound as a JSON string. For reusable codecs, named representations, and direct streaming conversions, use `ValueCodec` and `StreamingValueCodec`. See [Modeling (OBNT)](/docs/modeling#custom-value-types) for more details.

## Backends and Streaming

SJF4J separates format handling from Java object binding. Its streaming architecture supports multiple backends through a common set of parser and generator operations.

~~~mermaid
flowchart TD
    A["JSON / YAML"] --> B["Streaming backends"]
    B --> C["Runtime Binding"]
    B --> D["Compiled Binding"]
    C --> E["Java object models"]
    D --> E
~~~

Supported backends include **Jackson 2/3, Gson, Fastjson2, JSON-P, SnakeYAML**, and the built-in **Simple JSON** implementation. Java Properties uses a separate runtime binder.

Runtime binding discovers available backend providers automatically, or you can choose one explicitly:

~~~java
Sjf4j sjf4j = Sjf4j.builder()
    .jsonProvider(new Jackson2BinderProvider())
    .includeNulls(false)
    .build();
~~~

Custom providers can integrate additional streaming parsers and generators. `ExternalNode` adapters also make supported third-party native object models available to SJF4J's structural APIs without eagerly converting them to Maps or Lists.

For backend dependencies and selection rules, see [Installation](/docs/installation#backends).

## Performance

Compiled Binding generates specialized Java code to reduce runtime metadata lookup and generic dispatch. Performance depends on the backend, object model, and workload.

See the measurements and methodology in [Binding on the JVM](/docs/performance/binding) and [Binding on GraalVM Native Image](/docs/performance/binding-native).
