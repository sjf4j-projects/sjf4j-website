---
title: "Navigating"
description: "JSONPath and JSON Pointer navigation over Java object graphs."
---

# Navigating

Navigate and modify supported data structures directly with JSONPath and JSON Pointer.

## Runtime Navigation

```java
String city = JsonPath.parse("$.address.city").get(user, String.class);
JsonPath.parse("$.address.city").put(user, "Shanghai");
```
The detailed guide will cover the supported query and mutation operations.

## JSONPath and JSON Pointer

This section will explain RFC 9535 JSONPath querying and RFC 6901 JSON Pointer access, including their differences.

## Compiled Navigation

Use `@CompiledNavigator` with methods such as `@GetByPath`. The guide will cover Get/Find/Put, static compilation, and explicit fallback behavior.

## Performance

See [JSONPath Navigation benchmarks](/docs/performance/path).
