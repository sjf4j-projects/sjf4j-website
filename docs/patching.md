---
title: "Patching"
description: "Apply JSON Patch, JSON Merge Patch, and indexed merge directly to Java objects."
---

# Patching

SJF4J supports JSON Patch, JSON Merge Patch, and indexed deep merging directly on Java object graphs.

| Mechanism | Best for | API |
| --- | --- | --- |
| [JSON Patch (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902) | Precise, path-based updates | `JsonPatch` |
| [JSON Merge Patch (RFC 7386)](https://www.rfc-editor.org/rfc/rfc7386) | Object-based partial updates | `Patches.mergePatch()` |
| Indexed Merge | Deep merging objects and arrays | `Patches.indexedMerge()` |

These operations work with supported OBNT representations, including POJOs, Maps, Lists, and `JsonObject` / `JsonArray`. Mutations are subject to the underlying Java object's capabilities.

## JSON Patch (RFC 6902)

JSON Patch applies an ordered list of operations using [JSON Pointer (RFC 6901)](https://www.rfc-editor.org/rfc/rfc6901) paths.

### Applying a Patch

```java
JsonObject user = JsonObject.of("name", "Bob", "age", 20);

JsonPatch patch = JsonPatch.fromJson(
        "[{\"op\":\"replace\",\"path\":\"/name\",\"value\":\"Alice\"},"
      + "{\"op\":\"add\",\"path\":\"/city\",\"value\":\"Paris\"},"
      + "{\"op\":\"remove\",\"path\":\"/age\"}]");

Object result = patch.apply(user);
// {"name":"Alice","city":"Paris"}
```

Operations execute in order. Updates to nested structures typically mutate the target in place; **always capture the returned root**, because an operation can replace or remove it.

### Generating a Patch

`JsonPatch.diff()` produces operations to transform one structure into another:

```java
List<Integer> source = Arrays.asList(1, 2, 3);
List<Integer> target = Arrays.asList(1, 5, 3, 4);

JsonPatch patch = JsonPatch.diff(source, target);
Object result = patch.apply(new ArrayList<>(source));
// [1, 5, 3, 4]
```

The result may contain references to values in `target`. Applying the generated patch also requires a representation that supports its mutations; for example, growing a List requires a resizable implementation.

### Operations

| Operation | Behavior |
| --- | --- |
| `add` | Add a member or insert an array element (`/-` appends) |
| `remove` | Remove an existing value |
| `replace` | Replace an existing value |
| `move` | Move a value from `from` to `path` |
| `copy` | Deep-copy a value from `from` to `path` |
| `test` | Assert structural equality with an expected value |
| `exist` *(SJF4J)* | Assert that a path exists |
| `ensurePut` *(SJF4J)* | Write a value, creating missing intermediate containers |

`test` and `exist` do not change the target. An operation failure stops execution and throws an exception, but **earlier changes are not rolled back**.

## JSON Merge Patch (RFC 7386)

Merge Patch recursively updates object members. Unlike JSON Patch, it does not use paths or operation lists.

```java
JsonObject user = JsonObject.of(
        "name", "Bob",
        "profile", JsonObject.of("city", "Paris", "age", 18),
        "tags", JsonArray.of("a", "b"));

JsonObject changes = JsonObject.of(
        "name", null,
        "profile", JsonObject.of("age", 20),
        "tags", JsonArray.of("x"));

Object result = Patches.mergePatch(user, changes);
```

Result:

```json
{
  "profile": {"city": "Paris", "age": 20},
  "tags": ["x"]
}
```

The rules are straightforward:

- **Objects** merge recursively.
- **Arrays** are replaced as a whole.
- **`null`** removes an object member instead of assigning a null value.

A non-object patch replaces the entire root, so keep the return value. Removing a declared POJO property is not supported and fails rather than setting the field to `null`.

## Indexed Merge

Indexed Merge is an SJF4J extension for **in-place deep merging**. Objects merge by key; arrays merge by index instead of being replaced.

```java
JsonObject state = JsonObject.of(
        "items", JsonArray.of(10, 20, 30, 40),
        "config", JsonObject.of("a", 1));

JsonObject changes = JsonObject.of(
        "items", JsonArray.of(null, 25, null),
        "config", JsonObject.of("b", 2));

Patches.indexedMerge(state, changes, true, false);
```

Result (`state`):

```json
{
  "items": [10, 25],
  "config": {"a": 1, "b": 2}
}
```

Null handling differs from Merge Patch:

- An object member with `null` **assigns null**; it does not remove the member.
- A non-final array `null` **skips** that index.
- A trailing array `null` **truncates** the array at that position; `[null]` clears an array.

The two flags control assignment:

| Parameter | Behavior |
| --- | --- |
| `overwrite` | `true`: replace existing non-null values; `false`: fill missing or null values |
| `deepCopy` | `true`: deep-copy assigned composite values instead of sharing references |

Indexed Merge mutates the existing target and returns `void`. It cannot truncate fixed-size Java arrays.

## Advanced Usage

Use `PatchOperation` to construct individual operations programmatically, or `OperationRegistry` to register custom operation handlers. See the [patch API source](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-core/src/main/java/org/sjf4j/patch) for details.
