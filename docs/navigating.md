---
title: "Navigating"
description: "Query and update Java objects with JSONPath, JSON Pointer, NodeStream, and compile-time generated navigation."
---

# Navigating

SJF4J brings **JSONPath (RFC 9535)** and **JSON Pointer (RFC 6901)** navigation to ordinary Java objects. Read, query, and update POJOs, JOJOs, Maps, Lists, and supported native JSON nodes through the same APIs — without building an intermediate JSON tree.

Choose runtime navigation for dynamic expressions, or `@CompiledNavigator` for paths known at compile time. Both operate on the [OBNT (Object-Based Node Tree)](/docs/modeling).

## Runtime Navigation

Parse a path once and reuse it across different object representations:

```java
JsonPath path = JsonPath.parse("$.address.city");

String city1 = path.get(user, String.class);
String city2 = path.get(map, String.class);
String city3 = path.get(jsonObject, String.class);
```

`JsonPath.parse()` accepts JSONPath expressions and slash-prefixed JSON Pointers. To parse Pointer syntax without trimming whitespace, use `JsonPointer.parse()` instead.

## Querying

### Get, Find, and Eval

| API | Purpose | Result |
| --- | --- | --- |
| `getNode(root)` | Read a single location without conversion | Node value or `null` |
| `get(root, Type.class)` | Read one value with strict conversion | Typed value or `null` |
| `getAs(root, Type.class)` | Read one value with lenient conversion | Converted value |
| `find(root, Type.class)` | Collect matching locations with strict conversion | `List<T>` |
| `findAs(root, Type.class)` | Collect matches with lenient conversion | `List<T>` |
| `eval(root)` | Evaluate a path, including terminal functions | Value, list, or function result |
| `contains(root)` | Check whether a location exists, even if its value is `null` | `boolean` |
| `hasNonNull(root)` | Check for an existing non-null value | `boolean` |

```java
String name = JsonPath.parse("$.name")
        .get(user, String.class);

List<String> names = JsonPath.parse("$.friends[*].name")
        .find(user, String.class);

List<String> adults = JsonPath.parse("$.friends[?@.age >= 18].name")
        .find(user, String.class);

Integer count = JsonPath.parse("$.friends[*].count()")
        .eval(user, Integer.class);
```

`get()` and `find()` use strict SJF4J conversion; `getAs()` and `findAs()` use lenient conversion. Dedicated typed getters (such as `getString()` and `getInt()`) and container getters (such as `getList()` and `getMap()`) are also available.

**Missing values and multiple matches:**

- `getNode()` returns `null` for both a missing location and an explicit JSON null. Use `contains()` to distinguish them.
- `find()` always returns a list, including an empty list when nothing matches; matching null values are retained.
- The untyped `eval()` returns a list for a non-function multi-match path, even when the list has zero or one element. A single-location path returns a value or `null`.
- Typed `eval(root, Type.class)` may unwrap a one-element multi-match result for a non-collection target. Terminal functions return their own result type.

## Mutating

Use `JsonPath` to update an object graph in place:

```java
JsonPath.parse("$.name").put(user, "Alice");

JsonPath.parse("$.settings.theme")
        .ensurePut(user, "dark");

JsonPath.parse("$.settings.language")
        .ensurePutIfAbsent(user, "en");

JsonPath.parse("$.tags[+]").put(user, "java");
```

| Method | Behavior |
| --- | --- |
| `put()` | Write when the final parent exists; replace a value or append at the end of a list |
| `putIfParentPresent()` | Skip the write when the final parent is missing |
| `ensurePut()` | Create missing intermediate containers before writing |
| `ensurePutIfAbsent()` | Create as needed; write only when the target is missing or null |
| `compute()` | Update matched locations with a callback |
| `add()` | JSON Patch-style insertion (array elements shift right) |
| `replace()` | Replace an existing target only |
| `removeIfPresent()` | Remove a target if it exists |

`put()` does not create missing parents, while `ensurePut()` does. For list indexes, `put()` replaces an existing element or appends when the index equals the list size; `add()` inserts instead. `ensurePutIfAbsent()` treats both missing and null values as absent, leaving existing non-null values unchanged.

Creating intermediate nodes depends on the Java types involved. An unknown ordinary POJO property cannot be invented, and a fixed-size Java array cannot be automatically extended.

For RFC 6902 operations across a patch document, see [Patching](/docs/patching).

## Syntax

SJF4J implements the principal JSONPath and JSON Pointer selection forms, together with documented extensions. This reference separates the standardized syntax from SJF4J-specific expressions and behavior.

### JSONPath

JSONPath is defined by [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535.html). Expressions typically start at `$` and combine selectors to address one or many nodes.

#### Path Selectors

| Syntax | Meaning | Example |
| --- | --- | --- |
| `$` | Root node | `$` |
| `$.name` | Dot-name selector | `$.user.name` |
| `$['name']` | Bracket-name selector | `$['user']['name']` |
| `$["first name"]` | Quoted name with spaces or special characters | `$["first name"]` |
| `$[0]` | Array index (zero-based) | `$.users[0]` |
| `$[-1]` | Negative index, counting from the end | `$.users[-1]` |
| `$.*` or `$[*]` | Wildcard, selecting immediate children | `$.users[*].name` |
| `$..name` | Descendant name selector | `$..name` |
| `$..*` | Descendant wildcard | `$..*` |
| `$..[0]` | Descendant index selector | `$..[0]` |
| `$[0,2,4]` | Union of indexes | `$.users[0,2]` |
| `$['name','age']` | Union of names | `$.user['name','age']` |
| `$[1:4]` | Slice: start inclusive, end exclusive | `$.users[1:4]` |
| `$[:3]` | Slice from the beginning | `$.users[:3]` |
| `$[2:]` | Slice through the end | `$.users[2:]` |
| `$[::2]` | Slice with positive step | `$.users[::2]` |
| `$[::-1]` | Slice with negative step (reverse) | `$.users[::-1]` |
| `$[?expression]` | Filter selector | `$.users[?@.active]` |

Bracket unions can mix names, indexes, and slices, for example `$[1,'name',2:5]` when applied to a compatible container. Unions preserve selector order and may produce duplicate matches.

Slice syntax is `[start:end:step]`. Bounds are optional, negative bounds count from the end, and a step of zero is invalid. Slice bounds use the RFC's I-JSON integer range; individual array indexes are limited by the supported index representation.

Use quoted bracket selectors for property names that cannot be expressed unambiguously with dot notation, especially names containing dots, spaces, or brackets.

#### Filter Expressions

A filter selector `[?expression]` selects array elements or object members for which its expression holds.

| Syntax | Meaning | Example |
| --- | --- | --- |
| `@` | Current candidate node | `@.age` |
| `$` | Document root | `$.minimumAge` |
| `@.field` | Relative path | `@.profile.city` |
| `@.field` | Existence test in a Boolean context | `?@.email` |
| `==`, `!=` | Equality / inequality | `?@.status == 'active'` |
| `<`, `<=`, `>`, `>=` | Ordered comparisons | `?@.age >= 18` |
| `&&` | Logical AND | `?@.active && @.age >= 18` |
| `\|\|` | Logical OR | `?@.vip \|\| @.score >= 90` |
| `!` | Logical NOT | `?!@.disabled` |
| `( ... )` | Grouping | `?(@.age >= 18 \|\| @.vip) && @.active` |
| `null`, `true`, `false` | Literal values | `?@.enabled == true` |
| `'text'`, `"text"` | String literals | `?@.role == 'admin'` |
| `42`, `-2.5` | Numeric literals | `?@.price < 42` |
| `match(...)`, `search(...)` | Standard regular-expression functions | `?match(@.name, 'A.*')` |

The `?` appears inside the surrounding brackets; for example:

```java
JsonPath.parse("$.users[?@.age >= 18]");
JsonPath.parse("$.users[?(@.vip || @.age >= 18) && @.active]");
JsonPath.parse("$.users[?@.age >= $.minimumAge]");
JsonPath.parse("$.users[?match(@.name, 'A.*')]");
```

Logical precedence is `!`, then `&&`, then `||`. Parentheses make grouping explicit. Filter operands may include path references, literals, and function calls.

**Missing is not null.** A missing path is distinct from a path that exists and contains `null`. Existence checks test whether a node is present, even if its value is null. Direct comparisons require singular operands, unless a terminal function reduces a multi-match input to a scalar.

#### Standard Functions (RFC 9535)

| Function | Purpose | Example |
| --- | --- | --- |
| `length(value)` | Length of a string, array, or object | `length(@.name)` |
| `count(nodes)` | Number of matched nodes | `count(@.tags[*])` |
| `match(text, pattern)` | Whole-string regex match | `match(@.name, 'A.*')` |
| `search(text, pattern)` | Substring regex search | `search(@.name, 'Ann')` |
| `value(nodes)` | Return the evaluated input value in SJF4J | `value(@.age)` |

The standard function style above is used **inside filters**. SJF4J's current `value()` implementation returns its input unchanged rather than enforcing the RFC's singular-nodelist restriction. `match()` and `search()` use Java `Pattern` semantics, **not strict [RFC 9485 I-Regexp](https://www.rfc-editor.org/rfc/rfc9485.html)**. `match()` requires a full-string match; `search()` finds a matching substring.

SJF4J also supports terminal functions in dot notation, with runtime evaluation semantics described below.

#### SJF4J Extensions

The following are SJF4J conveniences or extensions, not portable RFC 9535 JSONPath syntax.

| Syntax | Meaning | Example |
| --- | --- | --- |
| `in`, `nin` | Membership / non-membership | `$.users[?@.role in ['admin','editor']]` |
| `=~` | Regex matching operator | `$.users[?@.name =~ /^A/i]` |
| `/pattern/flags` | Regex literal for `=~` | `/^test/i` |
| `[+]` | Append position for writes | `$.tags[+]` |
| `@` as a path root | Current-node path, especially in filter processing | `@.name` |
| Root omitted | Parse a relative-looking expression from root | `name` |
| `.function()` | Terminal function evaluation | `$.prices.sum()` |

The `=~` operator performs a Java regex substring search and compiles its regex literal when the path is parsed. Unlike `=~`, `match()` and `search()` also accept dynamically evaluated pattern arguments, such as `match(@.name, @.pattern)` or `search(@.name, $.pattern)`; these functions compile the regex when evaluated. Regex literals accept `i` (case-insensitive), `m` (multiline), `s` (dotall), and `u` (Unicode case) flags. `g` is accepted but has no effect. `in` and `nin` accept array expressions, including array literals.

**Built-in terminal functions**

| Function | Input / behavior | Example |
| --- | --- | --- |
| `length()` | String length or object/array size | `$.name.length()` |
| `count()` | Size of an array-like result | `$.users[*].count()` |
| `match(pattern)` | Whole-string Java regex match | `$.name.match('A.*')` |
| `search(pattern)` | Substring Java regex search | `$.name.search('Ann')` |
| `value()` | Return the input value | `$.name.value()` |
| `sum()` | Sum numeric array elements | `$.prices.sum()` |
| `min()` | Minimum numeric array element | `$.prices.min()` |
| `max()` | Maximum numeric array element | `$.prices.max()` |
| `avg()` | Average of numeric array elements | `$.prices.avg()` |
| `stddev()` | Population standard deviation | `$.prices.stddev()` |
| `first()` | First array element | `$.users.first()` |
| `last()` | Last array element | `$.users.last()` |

These functions operate on the matched input, which may be a single node or the list produced by a multi-match query. Their handling of missing, empty, and non-applicable inputs depends on the function. Use `eval()` to evaluate terminal functions; `find()` is intended for path matches rather than terminal function results.

You can register a custom function with `FunctionRegistry`:

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

Registrations are global to the JVM; registering the same name replaces its existing function.

**Compiled placeholders** such as `$.friends[{index}].name` are a separate `@CompiledNavigator` feature. They are resolved from annotated method parameters and are not general-purpose runtime JSONPath variables.

### JSON Pointer

JSON Pointer is defined by [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901.html). It identifies **one location**, using slash-separated reference tokens rather than wildcard, filter, or slice selectors.

#### Pointer Tokens and Escaping

| Syntax | Meaning |
| --- | --- |
| `""` | Root document (empty pointer) |
| `/name` | Object member named `name` |
| `/users/0/name` | Nested member through array index `0` |
| `/` | Member with an empty string as its name |
| `/a~1b` | Member named `a/b` |
| `/m~0n` | Member named `m~n` |
| `/items/-` | Array append position in write operations |
| `/0` | Object member `"0"` or array index `0`, depending on parent type |

Escaping is defined token by token:

| Character in a member name | Pointer encoding |
| --- | --- |
| `~` | `~0` |
| `/` | `~1` |

For example, the member name `a~/b` is written `/a~0~1b`. Invalid `~` escape sequences are rejected.

```java
JsonPointer pointer = JsonPointer.parse("/users/0/name");

String name = pointer.get(user, String.class);
pointer.put(user, "Alice");

JsonPointer.parse("/items/-").add(user, "new item");
```

A canonical nonnegative integer token (within the 32-bit index range, without leading zeros except `0`) selects an array index when the parent is array-like, but remains an object key when the parent is object-like. Tokens such as `/01` are member names, not array indexes. The terminal `-` token is an append position for writable arrays, not a readable array element; on an object it can name the member `"-"`. A nonterminal `-` is an ordinary member name.

`JsonPointer.parse("")` selects the root, while `JsonPointer.parse("/")` selects the empty-name member. Unlike `JsonPath.parse()`, `JsonPointer.parse()` does not trim leading or trailing whitespace, because whitespace can be part of a token.

RFC 6901 also defines a URI-fragment representation beginning with `#`. The `JsonPointer.parse()` API accepts the plain pointer representation (`""` or strings beginning with `/`), **not** the `#...` fragment form.

#### JSONPath and Pointer Interoperability

```java
JsonPath path = JsonPath.parse("/users/0/name");
JsonPointer pointer = JsonPointer.parse("/users/0/name");

String expr = pointer.toExpr();          // JSONPath expression
String ptr = path.toPointerExpr();       // JSON Pointer expression
```

`JsonPath.parse()` recognizes slash-prefixed input as Pointer syntax. Conversion to a Pointer is only available for paths that identify a single location using representable name/index tokens; wildcard, filter, union, slice, and descendant selectors cannot be converted to a JSON Pointer.

## NodeStream

`NodeStream` combines navigation over OBNT values with Java Stream-style processing. Path-based operations can read one value per item or flatten multiple matches.

```java
List<String> names = NodeStream.of(user)
        .findByPath("$.friends[*].name", String.class)
        .filter(name -> name.length() > 3)
        .distinct()
        .toList();
```

| Method | Behavior |
| --- | --- |
| `getByPath()` / `asByPath()` | Map each input to a single path value |
| `findByPath()` / `findAsByPath()` | Flatten all matching nodes per input |
| `evalByPath()` / `evalAsByPath()` | Evaluate each input and flatten list results |
| `filter()`, `map()`, `distinct()`, `sorted()` | Standard stream-style transformations |
| `toList()`, `count()`, `collect()` | Terminal operations |

Each `NodeStream` wraps a single-use Java stream. Its terminal operation consumes the stream.

## Compiled Navigation

For paths known at build time, `@CompiledNavigator` generates specialized Java implementations. Direct property accesses and supported traversals can avoid repeated expression interpretation.

Define an interface (with `User`, `Friend`, and `Settings` as ordinary Java classes):

```java
@CompiledNavigator(fallback = true)
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

Create and reuse the generated implementation:

```java
UserNavigator nav = CompiledInstances.create(UserNavigator.class);

String name = nav.name(user);
String friend = nav.friendName(user, 0);
List<String> adults = nav.adultNames(user);

nav.setTheme(user, "dark");
```

### Supported Operations

| Annotation | Behavior |
| --- | --- |
| `@GetByPath` | Single-target read |
| `@FindByPath` | Multi-target query returning `List<T>` |
| `@PutByPath` | Write when parent exists |
| `@PutIfParentPresentByPath` | Skip writes when parent is missing |
| `@EnsurePutByPath` | Create missing intermediate containers and write |
| `@EnsurePutIfAbsentByPath` | Write only when target is missing or null |

The root object is the first method parameter. For write methods the value is last; intervening parameters can supply path placeholders such as `{index}` (array index) or `{key}` (object key). Paths are fixed at compilation, even though placeholder values are supplied at runtime.

`@GetByPath` and the write annotations require single-target paths; `@FindByPath` supports wildcard, slice, union, and descendant traversal, including nested combinations. Generated reads return `null` for missing paths when the return type is a reference type; primitive return types cannot represent a missing value. Missing parents still constrain write operations, and `ensure` operations cannot create the root object or extend fixed-size Java arrays.

### Compilation and Fallback

Compiled navigation **does not delegate the entire path to the runtime evaluator**. Supported property, index, wildcard, slice, union, and recursive-descendant traversals are generated as Java code.

When `@CompiledNavigator(fallback = true)` is set, a `@FindByPath` filter predicate may use a cached runtime `FilterExpr` while the surrounding traversal remains generated. This is **not** a whole-path fallback; unsupported operations fail at compile time.

For annotation processing setup, see [Installation](/docs/installation). For code generation and instance lifecycle, see [Compiled APIs](/docs/compiled).

## Performance

SJF4J provides runtime JSONPath navigation and compile-time generated alternatives. Their performance depends on the path, object representation, and workload; compiled navigation can reduce overhead substantially for statically typed POJO access.

See [Benchmarks](/docs/benchmarks) for measured comparisons with Jayway JsonPath and the test methodology.
