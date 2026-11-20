---
title: "外部节点"
description: "直接使用第三方库的原生 JSON 树，并通过 ExternalNode 适配器扩展 SJF4J 的 OBNT 模型。"
translationSourceSha: "771c104b81d1c82a3d0c33a24f6c4060ca568b75"
---

# 外部节点 {#external-nodes}

`ExternalNode` 适配器可以将第三方 JSON 树接入 SJF4J 的 **OBNT (Object-Based Node Tree)** 模型。结构化 API 直接操作原生对象，无需转换成 Map、List 或 POJO。

## 支持的原生模型 {#supported-native-models}

| 第三方库 | 原生节点类型 |
| --- | --- |
| Jackson 2.x | `com.fasterxml.jackson.databind.JsonNode` |
| Jackson 3.x | `tools.jackson.databind.JsonNode` |
| Gson | `com.google.gson.JsonElement` |
| JSON-P | `jakarta.json.JsonValue` |

对应的 SJF4J 后端模块已提供适配器。依赖配置参阅 [Backends & Formats](/docs/backends)。

## Gson 示例 {#example-gson}

```java
import com.google.gson.JsonObject;

JsonObject user = new JsonObject();
user.addProperty("name", "Alice");

System.out.println(JsonType.of(user)); // OBJECT

String name = Nodes.toString(Nodes.getInObject(user, "name")); // "Alice"
Nodes.putInObject(user, "active", new JsonPrimitive(true));
```

`user` 仍然是 Gson 的 `JsonObject`。SJF4J 将类型识别、属性读取和修改委托给 Gson 适配器，**不会构建中间 JSON 树**。

**是否可修改取决于原生模型。** Gson 的 `JsonObject` 和 `JsonArray` 可变；JSON-P 的 `JsonObject` 和 `JsonArray` 不可变，因此不支持原地写入。具体可用操作取决于适配器实现。

## 添加自定义 ExternalNode {#adding-a-custom-externalnode}

下面用 **Gson 作为第三方对象模型示例**。SJF4J 已自带完整的 Gson 适配器，通常只需要引入 `sjf4j-backend-gson`。

**不要将此示例与 `sjf4j-backend-gson` 同时注册：两个 `JsonElement` 适配器会发生冲突。**

如果要独立运行示例，请仅添加 `sjf4j-core` 和 Gson 原生库，**不要引入 `sjf4j-backend-gson` 或聚合模块 `sjf4j`**。

### 1. 实现 ExternalNode {#1-implement-externalnode}

针对第三方库的根节点类型实现 `ExternalNode<N>`。只有 `nodeType()` 和 `jsonType()` 是必需方法；按需实现其他操作。

```java
// ExampleGsonNode.java
package com.example.sjf4j;

import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import org.sjf4j.JsonType;
import org.sjf4j.exception.NodeException;
import org.sjf4j.external.ExternalNode;

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

这个最小适配器支持节点类型识别、直接读取或修改对象属性，以及字符串转换。可以根据需要增加数组访问、遍历、复制和访问元数据等操作。未实现的操作会直接失败。

### 2. 提供适配器 {#2-provide-the-adapter}

```java
// ExampleGsonProvider.java
package com.example.sjf4j;

import org.sjf4j.external.ExternalNode;
import org.sjf4j.external.ExternalProvider;

public final class ExampleGsonProvider implements ExternalProvider {
    @Override
    public ExternalNode<?> externalNode() {
        return new ExampleGsonNode();
    }
}
```

如果原生库是可选依赖，请在创建适配器前检测其可用性；只有在库缺失时才返回 `null`。Provider 类自身应当能够在未安装可选库的情况下加载。

### 3. 通过 SPI 注册 {#3-registration-via-spi}

创建 `src/main/resources/META-INF/services/org.sjf4j.external.ExternalProvider`，写入 Provider 的完整类名：

```text
com.example.sjf4j.ExampleGsonProvider
```

`ExternalRegistry` 在初始化时自动发现 Provider，SJF4J 将受支持的节点操作分派给匹配的适配器。

### 4. 使用适配器 {#4-use-it}

在应用类路径中加入 Provider 后，[前面的 Gson 示例](#example-gson) 即可通过相同的 `JsonType` 和 `Nodes` API 工作，无需显式注册。

完整实现参阅 [GsonNode](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-backend-gson/src/main/java/org/sjf4j/backend/gson/external/GsonNode.java) 与 [GsonExternalProvider](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-backend-gson/src/main/java/org/sjf4j/backend/gson/external/GsonExternalProvider.java)。另请参阅 [ExternalNode](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-core/src/main/java/org/sjf4j/external/ExternalNode.java) 和 [OBNT 模型](/docs/modeling)。

**API 参考（最新发布版本）：** [ExternalNode](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/external/ExternalNode.html) · [ExternalProvider](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/external/ExternalProvider.html) · [ExternalRegistry](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/external/ExternalRegistry.html)
