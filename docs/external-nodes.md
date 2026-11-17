---
title: "External Nodes"
description: "Use native JSON tree models from other libraries directly with SJF4J's structural APIs."
---

# External Nodes

SJF4J can work directly with JSON tree objects created by other libraries. An `ExternalNode` adapter connects their native types to the **OBNT (Object-Based Node Tree)** model, without first converting them to Maps, Lists, or POJOs.

## Supported Native Models

| Library | Native node type |
| --- | --- |
| Jackson 2.x | `com.fasterxml.jackson.databind.JsonNode` |
| Jackson 3.x | `tools.jackson.databind.JsonNode` |
| Gson | `com.google.gson.JsonElement` |
| JSON-P | `jakarta.json.JsonValue` |

The matching SJF4J backend module provides the adapter. See [Backends & Formats](/docs/backends) for modules and dependencies.

## Example: Jackson 2.x

```java
ObjectNode user = new ObjectMapper().createObjectNode()
        .put("name", "Alice");

JsonType.of(user); // OBJECT
String name = Nodes.toString(Nodes.getInObject(user, "name")); // "Alice"

Nodes.putInObject(user, "active", BooleanNode.TRUE);
```

The `ObjectNode` remains a Jackson object. SJF4J's structural operations dispatch to the adapter; there is no intermediate tree.

**Mutability follows the native model.** Jackson's `ObjectNode` and `ArrayNode` are mutable. JSON-P's `JsonObject` and `JsonArray` are immutable, so in-place writes are not supported. Available operations depend on the adapter and underlying type.

## Adding an Adapter

An integration has two parts:

1. Implement `ExternalNode<N>` to classify native values and expose the structural operations you support.
2. Implement `ExternalProvider` and register its class in `META-INF/services/org.sjf4j.external.ExternalProvider`.

`ExternalRegistry` discovers providers using `ServiceLoader`. Optional integrations can return `null` when their native library is unavailable; unsupported operations fail explicitly.

See the source contracts for [ExternalNode](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/external/ExternalNode.java) and [ExternalProvider](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/external/ExternalProvider.java), or learn more about the underlying [OBNT model](/docs/modeling).
