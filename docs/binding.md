---
title: "Binding"
description: "Runtime and compiled binding across JSON, YAML, and Java object models."
---

# Binding

Binding connects serialized data with POJOs, Maps, Lists, JOJO/JAJO types, and other supported Java values.

## Runtime Binding

```java
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);
String output = sjf4j.toJsonString(user);
```

## Compiled Binding

Use `@CompiledBinder` to generate specialized binders. This section will cover read/write methods and supported formats.

## Advanced Binding

Upcoming details include type handling, polymorphism, ValueCodec, streaming APIs, and external nodes.

## Performance

See [JSON Binding benchmarks](/docs/performance/binding) and [Native Image Binding benchmarks](/docs/performance/binding-native).
