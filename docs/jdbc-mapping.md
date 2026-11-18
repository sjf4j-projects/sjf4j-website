---
title: "JDBC Result Mapping"
description: "Map JDBC ResultSet rows to Java objects with generated CompiledJdbcMapper implementations."
---

# JDBC Result Mapping

`@CompiledJdbcMapper` generates direct mappings from JDBC `ResultSet` columns to Java objects. It handles **row mapping**, not SQL execution, connection management, or transactions.

Targets include POJOs, records, JOJOs, and `Map<String, Object>`. This is separate from Java-to-Java [Object Mapping](/docs/mapping).

## Getting Started

Start with an ordinary Java class:

```java
class User {
    public String userName;
    public int age;

    public User() {}
}
```

Declare single-row, multi-row, or prepared mappings:

```java
@CompiledJdbcMapper
interface UserJdbcMapper {
    User user(ResultSet rs);
    List<User> users(ResultSet rs);
    JdbcRowMapper<User> prepare(ResultSetMetaData metadata);
}

UserJdbcMapper mapper = CompiledInstances.create(UserJdbcMapper.class);

try (Statement statement = connection.createStatement();
     ResultSet rs = statement.executeQuery(
             "SELECT user_name, age FROM users")) {
    List<User> users = mapper.users(rs);
}
```

The `ResultSet` must be positioned **before its first row** for the first two methods; generated code advances the cursor.

| Method | Behavior |
| --- | --- |
| `User user(ResultSet rs)` | Returns one object, `null` if empty, and fails on multiple rows by default |
| `List<User> users(ResultSet rs)` | Reads the remaining rows into a list |

Use `@JdbcMappingOptions(singleResult = SingleResultPolicy.FIRST)` when a single-object method should select only the first row.

SJF4J never closes the supplied ResultSet. Your JDBC code remains responsible for its lifecycle.

## Prepared Row Mapping

For an existing cursor loop, prepare a reusable row mapper from the result metadata:

```java
JdbcRowMapper<User> rowMapper = mapper.prepare(rs.getMetaData());

while (rs.next()) {
    User user = rowMapper.map(rs);
    // Process the current row
}
```

`prepare()` resolves the column layout once. The returned `JdbcRowMapper<User>` keeps column indexes and labels but **does not own the ResultSet**.

`map(rs)` maps only the current row: it does not advance or close the cursor. Prepared row mappers are stateless and reusable for results with the same column layout.

## Column Mapping

Column labels match Java properties automatically. For example, `user_name` maps to `userName` by default.

| `ColumnNamingPolicy` | Matching |
| --- | --- |
| `EXACT` | Exact label and case |
| `INSENSITIVE` | Exact first, then case-insensitive |
| `INSENSITIVE_SNAKE` | Also matches camelCase to snake_case (**default**) |

Override individual columns with `@Mapping`:

```java
@CompiledJdbcMapper
interface LegacyUserMapper {
    @Mapping(target = "userName", source = "full_name")
    User user(ResultSet rs);
}
```

Use `@JdbcMappingOptions` for method-specific behavior:

- `columnProjection = REQUIRE_ALL` (default) requires columns for mapped POJO properties; `PRESENT_ONLY` leaves absent mutable properties at their initial values.
- `singleResult = FAIL_ON_MULTIPLE` (default) rejects multiple rows for a single-object method; `FIRST` selects one.
- `columnNaming` selects the matching policy above.

An ambiguous match within the same naming tier fails explicitly. JDBC mapping also supports constructor/record targets and `@MappingCreator` for custom construction.

## Framework Integration

Prepared mappers work with existing JDBC frameworks. For example, with Spring `JdbcTemplate`:

```java
UserJdbcMapper mapper = CompiledInstances.create(UserJdbcMapper.class);

List<User> users = jdbcTemplate.query(
        "SELECT user_name, age FROM users", rs -> {
            JdbcRowMapper<User> rowMapper = mapper.prepare(rs.getMetaData());
            List<User> result = new ArrayList<>();
            while (rs.next()) {
                result.add(rowMapper.map(rs));
            }
            return result;
        });
```

Spring handles query execution and resource management; SJF4J maps the rows. With the optional starter, `UserJdbcMapper` is also available through `@Autowired` — no manual `CompiledInstances.create()` needed. See [Spring Boot Integration](/docs/spring-boot#spring-jdbc). Plain JDBC requires no Spring dependency.

To enable code generation, see [Installation](/docs/installation).

## Performance

In the measured Customer Account POJO workload, generated list mapping outperforms Spring JDBC's `BeanPropertyRowMapper` and MyBatis automatic mapping.

See [JDBC Result Mapping benchmarks](/docs/benchmarks#jdbc-result-mapping) and the [full benchmark report](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/jdbc-mapping.md). The benchmarks include ResultSet traversal and object materialization, **not SQL execution or network I/O**.

**API Reference (latest release):** [@CompiledJdbcMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/jdbc/CompiledJdbcMapper.html) · [JdbcRowMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/mapping/JdbcRowMapper.html) · [@JdbcMappingOptions](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/jdbc/JdbcMappingOptions.html)
