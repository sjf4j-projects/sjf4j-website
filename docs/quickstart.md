---
title: "Quickstart"
description: "A Java 8 quickstart: install SJF4J, parse JSON into a POJO, navigate and update it, and serialize it."
---

# Quickstart

This guide walks through a small, runnable Java example using an ordinary POJO. You do not need a special SJF4J base class.

## 1. Add the Dependency

SJF4J requires **Java 8 or newer**. For a quick start, add the all-in-one artifact to your Gradle project:

```kotlin
implementation("org.sjf4j:sjf4j:{version}")
```

Replace `{version}` with a [published release](https://central.sonatype.com/search?q=org.sjf4j). For Maven, modular dependencies, backend choices and annotation processing, see [Installation](/docs/installation).

## 2. Create and Run the Example

Create `Quickstart.java`:

```java
import org.sjf4j.Sjf4j;
import org.sjf4j.path.JsonPath;

public class Quickstart {
    public static class User {
        public String name;
        public int age;
        public Address address;
    }

    public static class Address {
        public String city;
    }

    public static void main(String[] args) {
        String json = "{\"name\":\"Alice\",\"age\":18,\"address\":{\"city\":\"Beijing\"}}";

        Sjf4j sjf4j = new Sjf4j();

        // JSON -> ordinary Java object
        User user = sjf4j.fromJson(json, User.class);

        // Update the existing POJO directly
        JsonPath.parse("$.address.city").put(user, "Shanghai");

        // Java object -> JSON
        String output = sjf4j.toJsonString(user);
        System.out.println(user.address.city);
        System.out.println(output);
    }
}
```

The first printed line is `Shanghai`. The next line is JSON containing the updated `"city":"Shanghai"` property (property ordering may depend on the backend).

This example uses normal Java fields and no intermediate JSON tree.

## 3. Try a Compiled API (Optional)

For compile-time code generation, add the annotation processor:

```kotlin
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```

Define a navigator interface:

```java
@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}
```

The annotation processor generates `UserNavigator_Impl`. Use `CompiledInstances.create(UserNavigator.class)` to get the generated implementation. See [Enjoy Compiled APIs](/docs/compiled) for setup, imports, and further examples.

## Next Steps

Explore [Binding](/docs/binding), [Navigating](/docs/navigating), [Modeling (OBNT)](/docs/modeling), or the [Capabilities overview](/).
