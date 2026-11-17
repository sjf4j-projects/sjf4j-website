---
title: "External Nodes"
description: "Use native JSON tree models directly with SJF4J and learn how to add an ExternalNode adapter."
---

# External Nodes

An `ExternalNode` adapter brings a third-party JSON tree into SJF4J's **OBNT (Object-Based Node Tree)** model. Structural APIs operate on native objects without converting them into Maps, Lists, or POJOs.

## Supported Native Models

| Library | Native node type |
| --- | --- |
| Jackson 2.x | `com.fasterxml.jackson.databind.JsonNode` |
| Jackson 3.x | `tools.jackson.databind.JsonNode` |
| Gson | `com.google.gson.JsonElement` |
| JSON-P | `jakarta.json.JsonValue` |

The matching SJF4J backend module already supplies the adapter. See [Backends & Formats](/docs/backends) for dependencies.

## Example: Gson

```java
JsonObject user = new JsonObject();
user.addProperty("name", "Alice");

JsonType.of(user); // OBJECT
String name = Nodes.toString(Nodes.getInObject(user, "name")); // "Alice"

Nodes.putInObject(user, "active", new JsonPrimitive(true));
```

`user` remains a Gson `JsonObject`. SJF4J delegates classification, lookup, and mutation to the Gson adapter; it never builds an intermediate tree.

**Mutability follows the native model.** Gson's `JsonObject` and `JsonArray` are mutable. JSON-P's `JsonObject` and `JsonArray` are immutable, so in-place writes are not supported. Available operations depend on the adapter.

## Adding a Custom ExternalNode

The following walkthrough uses **Gson as an example of a third-party object model**. SJF4J already ships a complete Gson adapter, so you normally need only `sjf4j-backend-gson`. **Do not register this example alongside that module:** two adapters for `JsonElement` will conflict.

To try the example independently, include `sjf4j-core` and the Gson library, *without* `sjf4j-backend-gson` or the aggregate `sjf4j` artifact.

### 1. Implement ExternalNode

Implement `ExternalNode<N>` for the library's root node type. Only `nodeType()` and `jsonType()` are mandatory; implement the operations you want to expose.

```java
// ExampleGsonNode.java (imports omitted)
public final class ExampleGsonNode implements ExternalNode<JsonElement> {
    @Override
    public Class<JsonElement> nodeType() {
        return JsonElement.class;
    }

    @Override
    public JsonType jsonType(JsonElement node) {
        if (node.isJsonNull()) return JsonType.NULL;
        if (node.isJsonObject()) return JsonType.OBJECT;
        if (node.isJsonArray()) return JsonType.ARRAY;
        JsonPrimitive value = node.getAsJsonPrimitive();
        if (value.isString()) return JsonType.STRING;
        if (value.isNumber()) return JsonType.NUMBER;
        if (value.isBoolean()) return JsonType.BOOLEAN;
        return JsonType.UNKNOWN;
    }

    @Override
    public Object getInObject(JsonElement node, String key) {
        return node.getAsJsonObject().get(key);
    }

    @Override
    public Object putInObject(JsonElement node, String key, Object value) {
        if (value != null && !(value instanceof JsonElement)) {
            throw new NodeException("expected a Gson JsonElement");
        }
        JsonObject object = node.getAsJsonObject();
        JsonElement previous = object.get(key);
        object.add(key, value == null ? JsonNull.INSTANCE : (JsonElement) value);
        return previous;
    }

    @Override
    public String toString(JsonElement node) {
        if (node.isJsonNull()) return null;
        if (node.isJsonPrimitive() && node.getAsJsonPrimitive().isString()) {
            return node.getAsString();
        }
        throw new NodeException("expected a Gson string node");
    }
}
```

This minimal adapter supports type classification, direct object lookup/mutation, and string conversion. Implement additional operations (array access, traversal, copying, and access metadata) as needed. Unimplemented operations fail fast.

### 2. Provide the adapter

```java
// ExampleGsonProvider.java
public final class ExampleGsonProvider implements ExternalProvider {
    @Override
    public ExternalNode<?> externalNode() {
        return new ExampleGsonNode();
    }
}
```

If the native library is optional, check whether it is available before constructing the adapter; return `null` only when the library is absent. Keep the provider class itself loadable without that optional dependency.

### 3. Register with ServiceLoader

Create `src/main/resources/META-INF/services/org.sjf4j.external.ExternalProvider` containing the provider's fully qualified class name:

```text
com.example.sjf4j.ExampleGsonProvider
```

`ExternalRegistry` discovers providers automatically at initialization, and SJF4J dispatches supported node operations to the matching adapter.

### 4. Use it

With the provider on the application classpath, the [Gson example above](#example-gson) works through the same `JsonType` and `Nodes` APIs. No explicit registration call is needed.

For the full production implementation, see [GsonNode](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-backend-gson/src/main/java/org/sjf4j/backend/gson/external/GsonNode.java) and [GsonExternalProvider](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-backend-gson/src/main/java/org/sjf4j/backend/gson/external/GsonExternalProvider.java). See also [ExternalNode](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/external/ExternalNode.java) and the [OBNT model](/docs/modeling).
