---
title: "Object Mapping"
description: "Convert Java object graphs with Runtime APIs or generated CompiledMapper implementations."
---

# Object Mapping

SJF4J maps between POJOs, records, Maps, collections, and JSON-oriented nodes. Use **Runtime conversion** for flexible transformations or **Compiled mapping** to generate specialized Java code.

## Runtime Mapping

`Sjf4j.convert()` transforms supported Java structures without serializing them:

```java
Map<String, Object> data = new HashMap<>();
data.put("name", "Alice");
data.put("age", 30);

UserDto dto = new Sjf4j().convert(data, UserDto.class);
```

Runtime conversion also supports nested models and generic collections through `TypeReference<T>`. Compatible values may be reused by reference; use `deepConvert()` when you need a recursive copy of supported structures.

## Compiled Mapping

`@CompiledMapper` generates implementations during annotation processing. Properties with the same name are mapped automatically.

These Java models are used in the examples:

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

### Automatic and explicit mappings

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

`toDto()` maps `name` and `age` by convention. `toView()` also fills `displayName` and reads `city` through JSONPath.

Use `@Mapping` to rename, ignore, or compute fields. Generated code uses normal Java property and constructor access without converting through JSON.

## Structural Mapping

A compiled mapper can work across Java and JSON-oriented representations:

```java
@CompiledMapper
interface StructuralMapper {
    UserDto fromMap(Map<String, Object> source);
    UserDto fromJsonObject(JsonObject source);

    Map<String, Object> toMap(User source);
    List<UserDto> toDtos(List<User> source);
}
```

Nested models, typed collections, and supported [External Nodes](/docs/external-nodes) can participate. Source mappings can use JSONPath or JSON Pointer, not just property names.

For nested **target** paths, `@Mapping` requires intermediate parents to exist. `@EnsureMapping` can create missing parents, while `@MappingIfParentPresent` skips a write when the final parent is missing.

## Updating Objects

A `void` mapper method updates an existing target:

```java
@CompiledMapper
interface UserUpdater {
    @MappingOptions(nulls = NullValuePolicy.IGNORE)
    void update(UserDto target, User source);
}

UserUpdater updater = CompiledInstances.create(UserUpdater.class);
updater.update(dto, user);
```

By default, null source properties overwrite target values. `NullValuePolicy.IGNORE` preserves them instead. All-null source arguments make an update a no-op; a null target may throw when a write is attempted.

`ArrayPolicy` and `ObjectPolicy` control updates to collections and Maps, including replacing existing values or merging entries.

## Advanced Features

| Feature | API |
| --- | --- |
| Computed properties | `@Mapping(sources = ..., compute = ...)` |
| Preferred converter methods | `@MappingOptions(converters = ...)` |
| Custom target construction | `@MappingCreator` |
| Dynamically typed raw values | `@MappingOptions(raws = RawPolicy.STRICT / CAST / LENIENT)` |
| Null, collection, and Map updates | `@MappingOptions` |
| Supported polymorphic mappings | `@OneOf` |

Compiled mapping supports type-safe enum conversions and selected `@NodeValue`/`ValueCodec` conversions. It follows declared source/target types and has compile-time restrictions; it is not a drop-in replacement for every Runtime conversion.

For exact signatures and constraints, consult the API reference below.

## Performance

`@CompiledMapper` is generally competitive with MapStruct for regular POJO mapping, while also supporting mixed Java/JSON-oriented structures. Results depend on the workload.

See [Object Mapping benchmarks](/docs/benchmarks#object-mapping) and the [full benchmark report](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/mapping.md). These tests measure mapping, not JSON binding or JDBC.

**API Reference (latest release):** [Sjf4j](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/Sjf4j.html) · [@CompiledMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/CompiledMapper.html) · [@Mapping](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/Mapping.html) · [@MappingOptions](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/MappingOptions.html)
