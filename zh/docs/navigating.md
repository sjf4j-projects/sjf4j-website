---
title: "对象导航"
description: "使用 JSONPath、JSON Pointer、NodeStream 和编译式导航查询、修改 Java 对象。"
translationSourceSha: "48669d7fde4b349b349b533cc4ad2221a381324c"
---

# 对象导航 {#navigating}

SJF4J 将 **JSONPath (RFC 9535)** 和 **JSON Pointer (RFC 6901)** 应用于普通 Java 对象。使用同一套 API 读取、查询、修改 POJO、JOJO、Map、List 以及受支持的原生 JSON 节点，**不必构建中间 JSON 树**。

对于动态表达式，可以使用 Runtime Navigation；对于编译期已知的路径，可以使用 `@CompiledNavigator`。两者都基于 [OBNT (Object-Based Node Tree)](/docs/modeling)。

## 运行时导航 {#runtime-navigation}

解析一次路径，即可在不同对象表示之间复用：

```java
JsonPath path = JsonPath.parse("$.address.city");

String city1 = path.get(user, String.class);
String city2 = path.get(map, String.class);
String city3 = path.get(jsonObject, String.class);
```

`JsonPath.parse()` 接受 JSONPath 表达式和以斜杠开头的 JSON Pointer。若要原样保留 Pointer 中的前后空白，请使用 `JsonPointer.parse()`。

## 查询 {#querying}

### Get、Find 与 Eval {#get-find-and-eval}

| API | 用途 | 结果 |
| --- | --- | --- |
| `getNode(root)` | 不做转换，读取单个位置 | 节点值或 `null` |
| `get(root, Type.class)` | 严格转换并读取单个值 | 指定类型的值或 `null` |
| `getAs(root, Type.class)` | 宽松转换并读取单个值 | 转换后的值 |
| `find(root, Type.class)` | 严格转换并收集匹配的位置 | `List<T>` |
| `findAs(root, Type.class)` | 宽松转换并收集匹配值 | `List<T>` |
| `eval(root)` | 求值，包括末尾函数 | 单值、列表或函数结果 |
| `contains(root)` | 判断位置是否存在，即使值为 `null` | `boolean` |
| `hasNonNull(root)` | 判断位置存在且值非 null | `boolean` |

```java
String name = JsonPath.parse("$.name").get(user, String.class);

List<String> names = JsonPath.parse("$.friends[*].name")
        .find(user, String.class);

List<String> adults = JsonPath.parse("$.friends[?@.age >= 18].name")
        .find(user, String.class);

Integer count = JsonPath.parse("$.friends[*].count()")
        .eval(user, Integer.class);
```

`get()` 和 `find()` 使用 SJF4J 严格转换；`getAs()` 和 `findAs()` 使用宽松转换。还提供 `getString()`、`getInt()` 等类型化 getter，以及 `getList()`、`getMap()` 等容器 getter。

**缺失值与多个匹配结果：**

- `getNode()` 对缺失位置和显式 JSON null 都返回 `null`；要区分两者，请使用 `contains()`。
- `find()` 总是返回列表；没有匹配时返回空列表，匹配到的 null 会被保留。
- 对于非函数的多匹配路径，无类型参数的 `eval()` 返回列表，即使结果只有零个或一个元素；单位置路径返回值或 `null`。
- `eval(root, Type.class)` 在目标类型不是集合时，可以解包仅包含一个元素的多匹配结果。末尾函数返回自己的结果类型。

## 修改 {#mutating}

使用 `JsonPath` 原地修改对象图：

```java
JsonPath.parse("$.name").put(user, "Alice");

JsonPath.parse("$.settings.theme")
        .ensurePut(user, "dark");

JsonPath.parse("$.settings.language")
        .ensurePutIfAbsent(user, "en");

JsonPath.parse("$.tags[+]").put(user, "java");
```

| 方法 | 行为 |
| --- | --- |
| `put()` | 最终父节点存在时写入；替换已有值或在列表末尾追加 |
| `putIfParentPresent()` | 最终父节点不存在时跳过写入 |
| `ensurePut()` | 创建缺失的中间容器后写入 |
| `ensurePutIfAbsent()` | 按需创建容器，仅在目标缺失或为 null 时写入 |
| `compute()` | 通过回调更新匹配位置 |
| `add()` | 按 JSON Patch 语义插入，数组后续元素右移 |
| `replace()` | 仅替换已经存在的目标 |
| `removeIfPresent()` | 目标存在时删除 |

`put()` 不会创建缺失的父节点，`ensurePut()` 则会创建。对于 List 下标，`put()` 会替换已有元素，或在下标等于列表长度时追加；`add()` 则是插入。`ensurePutIfAbsent()` 将缺失与 null 都视为不存在，不会覆盖已有的非 null 值。

能否创建中间节点取决于涉及的 Java 类型。普通 POJO 无法凭空添加未定义属性，固定长度的 Java 数组也不能自动扩容。

需要对整个补丁文档执行 RFC 6902 操作时，参阅 [Patching](/docs/patching)。

## 语法 {#syntax}

SJF4J 支持主要的 JSONPath 与 JSON Pointer 选择语法，以及明确列出的扩展。以下将标准语法和 SJF4J 特有行为分别说明。

### JSONPath {#jsonpath}

[JSONPath (RFC 9535)](https://www.rfc-editor.org/rfc/rfc9535.html) 表达式通常以 `$` 开头，通过组合选择器定位一个或多个节点。

#### 路径选择器 {#path-selectors}

| 语法 | 含义 | 示例 |
| --- | --- | --- |
| `$` | 根节点 | `$` |
| `$.name` | 点号属性选择 | `$.user.name` |
| `$['name']` | 方括号属性选择 | `$['user']['name']` |
| `$["first name"]` | 包含空格或特殊字符的属性名 | `$["first name"]` |
| `$[0]` | 数组下标（从 0 开始） | `$.users[0]` |
| `$[-1]` | 负下标，从末尾计数 | `$.users[-1]` |
| `$.*` 或 `$[*]` | 通配符，选择直接子节点 | `$.users[*].name` |
| `$..name` | 后代属性名选择 | `$..name` |
| `$..*` | 后代通配符 | `$..*` |
| `$..[0]` | 后代数组下标选择 | `$..[0]` |
| `$[0,2,4]` | 下标联合选择 | `$.users[0,2]` |
| `$['name','age']` | 属性名联合选择 | `$.user['name','age']` |
| `$[1:4]` | 切片：包含起点，不包含终点 | `$.users[1:4]` |
| `$[:3]` | 从开头截取 | `$.users[:3]` |
| `$[2:]` | 截取到末尾 | `$.users[2:]` |
| `$[::2]` | 正步长切片 | `$.users[::2]` |
| `$[::-1]` | 负步长切片（反向） | `$.users[::-1]` |
| `$[?expression]` | 过滤选择器 | `$.users[?@.active]` |

方括号联合选择可以混用属性名、下标和切片，例如在兼容容器上使用 `$[1,'name',2:5]`。联合选择保留选择器顺序，也可能产生重复结果。

切片形式为 `[start:end:step]`。边界可以省略；负边界从末尾计算；步长不能为零。切片边界使用 RFC 规定的 I-JSON 整数范围，单个数组下标则受内部下标表示范围限制。

当属性名包含点、空格或方括号等特殊字符时，应使用带引号的方括号选择器，避免歧义。

#### 过滤表达式 {#filter-expressions}

`[?expression]` 会选出表达式结果为真的数组元素或对象成员。

| 语法 | 含义 | 示例 |
| --- | --- | --- |
| `@` | 当前候选节点 | `@.age` |
| `$` | 文档根节点 | `$.minimumAge` |
| `@.field` | 相对路径 | `@.profile.city` |
| `@.field` | 布尔上下文中的存在性检查 | `?@.email` |
| `==`、`!=` | 相等 / 不相等 | `?@.status == 'active'` |
| `<`、`<=`、`>`、`>=` | 有序比较 | `?@.age >= 18` |
| `&&` | 逻辑与 | `?@.active && @.age >= 18` |
| `\\|\\|` | 逻辑或 | `?@.vip \\|\\| @.score >= 90` |
| `!` | 逻辑非 | `?!@.disabled` |
| `( ... )` | 分组 | `?(@.age >= 18 \\|\\| @.vip) && @.active` |
| `null`、`true`、`false` | 字面量 | `?@.enabled == true` |
| `'text'`、`"text"` | 字符串字面量 | `?@.role == 'admin'` |
| `42`、`-2.5` | 数字字面量 | `?@.price < 42` |
| `match(...)`、`search(...)` | 标准正则函数 | `?match(@.name, 'A.*')` |

问号 `?` 位于方括号内部，例如：

```java
JsonPath.parse("$.users[?@.age >= 18]");
JsonPath.parse("$.users[?(@.vip || @.age >= 18) && @.active]");
JsonPath.parse("$.users[?@.age >= $.minimumAge]");
JsonPath.parse("$.users[?match(@.name, 'A.*')]");
```

逻辑优先级依次为 `!`、`&&`、`||`，可以通过括号明确分组。过滤操作数可包含路径引用、字面量和函数调用。

**缺失不等于 null。** 路径不存在和路径存在但值为 null 是不同情况。存在性测试只判断节点是否存在，即使值为 null 也算存在。直接比较要求操作数是单值，除非通过末尾函数把多匹配结果归约为标量。

#### 标准函数（RFC 9535） {#standard-functions-rfc-9535}

| 函数 | 用途 | 示例 |
| --- | --- | --- |
| `length(value)` | 字符串、数组或对象的长度 | `length(@.name)` |
| `count(nodes)` | 匹配节点数量 | `count(@.tags[*])` |
| `match(text, pattern)` | 整个字符串匹配正则 | `match(@.name, 'A.*')` |
| `search(text, pattern)` | 字符串子串正则搜索 | `search(@.name, 'Ann')` |
| `value(nodes)` | 返回 SJF4J 求值得到的输入值 | `value(@.age)` |

上面的标准形式在**过滤表达式内部**使用。当前 SJF4J 的 `value()` 实现直接返回输入值，不强制执行 RFC 对单元素节点列表的限制。`match()` 与 `search()` 使用 Java `Pattern` 语义，**并非严格的 [RFC 9485 I-Regexp](https://www.rfc-editor.org/rfc/rfc9485.html)**。`match()` 要求全字符串匹配，`search()` 只要求匹配子串。

SJF4J 也支持点号形式的末尾函数，具体运行时语义见下文。

#### SJF4J 扩展 {#sjf4j-extensions}

以下是 SJF4J 扩展或便捷语法，不属于可移植的 RFC 9535 JSONPath 语法。

| 语法 | 含义 | 示例 |
| --- | --- | --- |
| `in`、`nin` | 包含 / 不包含 | `$.users[?@.role in ['admin','editor']]` |
| `=~` | 正则匹配运算符 | `$.users[?@.name =~ /^A/i]` |
| `/pattern/flags` | 配合 `=~` 的正则字面量 | `/^test/i` |
| `[+]` | 写入时的追加位置 | `$.tags[+]` |
| `@` 作为路径起点 | 当前节点路径，主要用于过滤 | `@.name` |
| 省略根节点 | 从根节点解析相对形式的表达式 | `name` |
| `.function()` | 末尾函数求值 | `$.prices.sum()` |

`=~` 执行 Java 正则子串搜索，并在解析路径时编译正则字面量。相比之下，`match()` 与 `search()` 也可接受动态求值的正则参数，例如 `match(@.name, @.pattern)`、`search(@.name, $.pattern)`；这些函数在求值时编译正则。

正则字面量支持 `i`（不区分大小写）、`m`（多行）、`s`（dotall）、`u`（Unicode 大小写）标志。`g` 被接受，但不会产生效果。`in` 和 `nin` 接受数组表达式，包括数组字面量。

**内置末尾函数**

| 函数 | 输入 / 行为 | 示例 |
| --- | --- | --- |
| `length()` | 字符串长度或对象/数组大小 | `$.name.length()` |
| `count()` | 类数组结果的大小 | `$.users[*].count()` |
| `match(pattern)` | 整个字符串的 Java 正则匹配 | `$.name.match('A.*')` |
| `search(pattern)` | Java 正则子串搜索 | `$.name.search('Ann')` |
| `value()` | 返回输入值 | `$.name.value()` |
| `sum()` | 数字数组求和 | `$.prices.sum()` |
| `min()` | 数字数组最小值 | `$.prices.min()` |
| `max()` | 数字数组最大值 | `$.prices.max()` |
| `avg()` | 数字数组平均值 | `$.prices.avg()` |
| `stddev()` | 总体标准差 | `$.prices.stddev()` |
| `first()` | 数组首元素 | `$.users.first()` |
| `last()` | 数组末元素 | `$.users.last()` |

这些函数操作匹配输入，输入可能是单个节点，也可能是多匹配查询产生的列表。缺失、空值或类型不适用时的行为依函数而定。使用 `eval()` 求值末尾函数；`find()` 用于路径节点匹配，而不是末尾函数的结果。

可以通过 `FunctionRegistry` 注册自定义函数：

```java
FunctionRegistry.register(
        new FunctionRegistry.FunctionDescriptor(
                "twice",
                (target, args) -> ((Number) target).intValue() * 2
        )
);

Integer result = JsonPath.parse("$.age.twice()")
        .eval(user, Integer.class);
```

函数注册在 JVM 内全局生效；同名注册会替换原有函数。

`$.friends[{index}].name` 这类**编译式占位符**是 `@CompiledNavigator` 的独立功能。它们在注解方法参数中解析，不是通用的 Runtime JSONPath 变量。

### JSON Pointer {#json-pointer}

[JSON Pointer (RFC 6901)](https://www.rfc-editor.org/rfc/rfc6901.html) 通过斜杠分隔的引用 token 定位**单个位置**，不支持通配符、过滤器或切片。

#### Pointer token 与转义 {#pointer-tokens-and-escaping}

| 语法 | 含义 |
| --- | --- |
| `""` | 根文档（空 Pointer） |
| `/name` | 名为 `name` 的对象成员 |
| `/users/0/name` | 经数组下标 `0` 访问嵌套成员 |
| `/` | 名称为空字符串的成员 |
| `/a~1b` | 名为 `a/b` 的成员 |
| `/m~0n` | 名为 `m~n` 的成员 |
| `/items/-` | 写入时的数组追加位置 |
| `/0` | 对象属性 `"0"` 或数组下标 `0`，取决于父节点类型 |

转义按 token 处理：

| 属性名中的字符 | Pointer 编码 |
| --- | --- |
| `~` | `~0` |
| `/` | `~1` |

例如成员名 `a~/b` 应表示为 `/a~0~1b`，无效的 `~` 转义序列会被拒绝。

```java
JsonPointer pointer = JsonPointer.parse("/users/0/name");

String name = pointer.get(user, String.class);
pointer.put(user, "Alice");

JsonPointer.parse("/items/-").add(user, "new item");
```

当父节点是数组时，规范化的非负整数 token（在 32 位下标范围内，且除 `0` 外不能有前导零）作为数组下标；当父节点是对象时，它仍是属性名。`/01` 这样的 token 是成员名，不是数组下标。

末尾 `-` token 在可写数组中表示追加位置，并不是可读取的数组元素；在对象中它可以表示名为 `"-"` 的成员。非末尾的 `-` 被当作普通成员名。

`JsonPointer.parse("")` 选择根节点；`JsonPointer.parse("/")` 选择空名称成员。与 `JsonPath.parse()` 不同，`JsonPointer.parse()` 不会去掉首尾空白，因为空白可能是 token 的一部分。

RFC 6901 还定义了以 `#` 开头的 URI fragment 表示。但 `JsonPointer.parse()` 只接受普通 Pointer 形式（`""` 或以 `/` 开头的字符串），**不接受 `#...` 形式**。

#### JSONPath 与 Pointer 互操作 {#jsonpath-and-pointer-interoperability}

```java
JsonPath path = JsonPath.parse("/users/0/name");
JsonPointer pointer = JsonPointer.parse("/users/0/name");

String expr = pointer.toExpr();          // JSONPath expression
String ptr = path.toPointerExpr();       // JSON Pointer expression
```

`JsonPath.parse()` 会将斜杠开头的输入识别为 Pointer。只有路径能以属性名/下标 token 唯一定位一个位置时，才可以转换为 Pointer；通配符、过滤器、联合、切片和后代选择都不能转换。

## NodeStream {#nodestream}

`NodeStream` 将 OBNT 值上的导航与 Java Stream 风格的处理结合起来。基于路径的操作可以为每个元素读取单个值，也可以展开多个匹配结果。

```java
List<String> names = NodeStream.of(user)
        .findByPath("$.friends[*].name", String.class)
        .filter(name -> name.length() > 3)
        .distinct()
        .toList();
```

| 方法 | 行为 |
| --- | --- |
| `getByPath()` / `asByPath()` | 将每个输入映射到单个路径值 |
| `findByPath()` / `findAsByPath()` | 展开每个输入匹配到的所有节点 |
| `evalByPath()` / `evalAsByPath()` | 求值并展开列表结果 |
| `filter()`、`map()`、`distinct()`、`sorted()` | 标准流式转换 |
| `toList()`、`count()`、`collect()` | 终止操作 |

每个 `NodeStream` 都包装了一个只能使用一次的 Java Stream；终止操作会消费它。

## 编译式导航 {#compiled-navigation}

对于构建时已知的路径，`@CompiledNavigator` 生成专用 Java 实现。直接属性访问和受支持的遍历可以避免重复解释表达式。

定义接口（`User`、`Friend` 和 `Settings` 均为普通 Java 类）：

```java
@CompiledNavigator
interface UserNavigator {

    @GetByPath("$.name")
    String name(User user);

    @GetByPath("$.friends[{index}].name")
    String friendName(User user, int index);

    @FindByPath("$.friends[*].name")
    List<String> friendNames(User user);

    @FindByPath("$.friends[?@.age >= 18].name")
    List<String> adultNames(User user);

    @EnsurePutByPath("$.settings.theme")
    void setTheme(User user, String value);
}
```

创建并复用生成的实现：

```java
UserNavigator nav = CompiledInstances.create(UserNavigator.class);

String name = nav.name(user);
String friend = nav.friendName(user, 0);
List<String> adults = nav.adultNames(user);

nav.setTheme(user, "dark");
```

### 支持的操作 {#supported-operations}

| 注解 | 行为 |
| --- | --- |
| `@GetByPath` | 读取单个目标 |
| `@FindByPath` | 多目标查询，返回 `List<T>` |
| `@PutByPath` | 父节点存在时写入 |
| `@PutIfParentPresentByPath` | 父节点缺失时跳过写入 |
| `@EnsurePutByPath` | 创建缺失的中间容器并写入 |
| `@EnsurePutIfAbsentByPath` | 仅在目标缺失或为 null 时写入 |

根对象是方法的第一个参数。写操作的值参数位于最后；中间参数可以为 `{index}`（数组下标）、`{key}`（对象成员名）等占位符提供值。路径在编译期固定，占位符的值则在运行时传入。

`@GetByPath` 和写注解要求单目标路径；`@FindByPath` 支持通配符、切片、联合和后代遍历，包括嵌套组合。生成的读取方法在路径缺失且返回类型是引用类型时返回 `null`；基本类型无法表示缺失值。写操作仍受父节点是否存在的限制，`ensure` 操作也不能创建根对象或扩容固定长度的 Java 数组。

### 编译与回退 {#compilation-and-fallback}

编译式导航**不会将整条路径委托给运行时求值器**。支持的属性、下标、通配符、切片、联合与递归后代遍历会生成 Java 代码。

配置 `@CompiledNavigator(fallback = true)` 后，`@FindByPath` 的过滤谓词可以通过缓存的 Runtime `FilterExpr` 求值，而外围遍历仍使用生成代码。这**不是整条路径的回退**；不支持的操作仍会在编译期失败。

注解处理器配置参阅 [Installation](/docs/installation)；代码生成与实例生命周期参阅 [Compiled APIs](/docs/compiled)。

## 性能 {#performance}

SJF4J 同时提供 Runtime JSONPath 导航与编译式实现。性能取决于路径、对象表示和负载；对于静态类型的 POJO 访问，编译式导航可以显著降低开销。

与 Jayway JsonPath 的测试对比和方法参阅 [Benchmarks](/docs/benchmarks)。

**API 参考（最新发布版本）：** [JsonPath](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/path/JsonPath.html) · [JsonPointer](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/path/JsonPointer.html) · [@CompiledNavigator](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/path/CompiledNavigator.html) · [NodeStream](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/node/NodeStream.html)
