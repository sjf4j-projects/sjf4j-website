---
title: "Quickstart"
description: "Parse JSON, navigate Java objects, and use a compiled accessor."
---

# Quickstart

This guide demonstrates the core programming model with a normal Java POJO. Install SJF4J first using [Installation](/docs/installation).

## 1. Define a Java Model

```java
public class User {
    public String name;
    public int age;
    public Address address;
}

public class Address {
    public String city;
}
```

## 2. Parse, Update, and Serialize

```java
String json = "{\"name\":\"Alice\",\"age\":18,\"address\":{\"city\":\"Beijing\"}}";
Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);
JsonPath.parse("$.address.city").put(user, "Shanghai");
String output = sjf4j.toJsonString(user);
```

## 3. Introduce a Compiled API

An annotated interface can generate a typed implementation at compile time:

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

See [Compiled APIs](/docs/compiled) for annotation-processor configuration and instantiation.

## Next Steps

Explore [Binding](/docs/binding), [Navigating](/docs/navigating), or [Modeling (OBNT)](/docs/modeling).
