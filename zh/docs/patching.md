---
title: "对象补丁"
description: "直接对 Java 对象应用 JSON Patch、JSON Merge Patch 和索引合并。"
translationSourceSha: "87f5d22ee04ebf6af2bd7291915453a47debc8cb"
---

# 对象补丁 {#patching}

SJF4J 支持直接对 Java 对象图应用 JSON Patch、JSON Merge Patch 和按索引深度合并。

| 机制 | 适用场景 | API |
| --- | --- | --- |
| [JSON Patch (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902) | 基于精确路径的更新 | `JsonPatch` |
| [JSON Merge Patch (RFC 7386)](https://www.rfc-editor.org/rfc/rfc7386) | 基于对象的局部更新 | `Patches.mergePatch()` |
| Indexed Merge | 对对象和数组进行深度合并 | `Patches.indexedMerge()` |

这些操作适用于受支持的 OBNT 表示，包括 POJO、Map、List、`JsonObject` 和 `JsonArray`。具体修改能力仍受底层 Java 对象约束。

## JSON Patch (RFC 6902) {#json-patch-rfc-6902}

JSON Patch 使用 [JSON Pointer (RFC 6901)](https://www.rfc-editor.org/rfc/rfc6901) 路径，按顺序执行一组操作。

### 应用补丁 {#applying-a-patch}

```java
JsonObject user = JsonObject.of("name", "Bob", "age", 20);

JsonPatch patch = JsonPatch.fromJson(
        "[{\"op\":\"replace\",\"path\":\"/name\",\"value\":\"Alice\"},"
      + "{\"op\":\"add\",\"path\":\"/city\",\"value\":\"Paris\"},"
      + "{\"op\":\"remove\",\"path\":\"/age\"}]");

Object result = patch.apply(user);
// {"name":"Alice","city":"Paris"}
```

操作按声明顺序执行。嵌套结构通常会被原地修改，但**务必接收返回的根对象**，因为操作也可能替换或删除根节点。

### 生成补丁 {#generating-a-patch}

`JsonPatch.diff()` 可生成将一个结构转换成另一个结构所需的操作：

```java
List<Integer> source = Arrays.asList(1, 2, 3);
List<Integer> target = Arrays.asList(1, 5, 3, 4);

JsonPatch patch = JsonPatch.diff(source, target);
Object result = patch.apply(new ArrayList<>(source));
// [1, 5, 3, 4]
```

生成结果可能引用 `target` 中的值。应用补丁时，目标表示也必须支持所需的修改；例如，扩展 List 需要使用可扩容的实现。

### 支持的操作 {#operations}

| 操作 | 行为 |
| --- | --- |
| `add` | 添加对象成员，或插入数组元素（`/-` 表示追加） |
| `remove` | 删除已存在的值 |
| `replace` | 替换已存在的值 |
| `move` | 将值从 `from` 移动到 `path` |
| `copy` | 从 `from` 深复制值到 `path` |
| `test` | 断言目标与预期值在结构上相等 |
| `exist` *（SJF4J 扩展）* | 断言路径存在 |
| `ensurePut` *（SJF4J 扩展）* | 创建缺失的中间容器并写入 |

`test` 与 `exist` 不会修改目标。操作失败时会抛出异常并停止后续执行，但**之前已经执行的修改不会回滚**。

## JSON Merge Patch (RFC 7386) {#json-merge-patch-rfc-7386}

Merge Patch 递归更新对象成员。与 JSON Patch 不同，它不使用路径或操作列表。

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

结果：

```json
{
  "profile": {"city": "Paris", "age": 20},
  "tags": ["x"]
}
```

规则如下：

- **对象**：递归合并。
- **数组**：整体替换。
- **`null`**：删除对象成员，而不是把成员赋值为 null。

当补丁不是对象时，会替换整个根节点，因此需要保留返回值。删除 POJO 中已声明的属性不受支持，会直接失败，而不是将字段设置为 `null`。

## Indexed Merge {#indexed-merge}

Indexed Merge 是 SJF4J 的**原地深度合并**扩展。对象按键合并；数组按索引合并，而非整体替换。

```java
JsonObject state = JsonObject.of(
        "items", JsonArray.of(10, 20, 30, 40),
        "config", JsonObject.of("a", 1));

JsonObject changes = JsonObject.of(
        "items", JsonArray.of(null, 25, null),
        "config", JsonObject.of("b", 2));

Patches.indexedMerge(state, changes, true, false);
```

结果（`state`）：

```json
{
  "items": [10, 25],
  "config": {"a": 1, "b": 2}
}
```

这里的 null 处理与 Merge Patch 不同：

- 对象成员为 `null` 时，会**赋值为 null**，而不是删除成员。
- 数组中**非末尾**的 `null` 会跳过该索引。
- 数组**末尾**的 `null` 会在相应位置截断数组；`[null]` 会清空数组。

两个标志控制赋值行为：

| 参数 | 含义 |
| --- | --- |
| `overwrite` | `true`：覆盖已有的非 null 值；`false`：仅填充缺失或 null 的值 |
| `deepCopy` | `true`：深复制被赋值的复合结构，而不是共享引用 |

Indexed Merge 会原地修改目标，返回 `void`；它无法截断固定长度的 Java 数组。

## 高级用法 {#advanced-usage}

可以使用 `PatchOperation` 在代码中构造单个操作，也可以通过 `OperationRegistry` 注册自定义操作处理器。详见 [Patch API 源码](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-core/src/main/java/org/sjf4j/patch)。

**API 参考（最新发布版本）：** [JsonPatch](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/patch/JsonPatch.html) · [Patches](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/patch/Patches.html) · [PatchOperation](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/patch/PatchOperation.html) · [OperationRegistry](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/patch/OperationRegistry.html)
