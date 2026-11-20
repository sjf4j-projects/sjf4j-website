---
title: "JDBC 结果映射"
description: "使用编译式 CompiledJdbcMapper 将 JDBC ResultSet 直接映射为 Java 对象。"
translationSourceSha: "2c32fb4646097065e6256c7ce0cad9408dbb39f1"
---

# JDBC 结果映射 {#jdbc-result-mapping}

`@CompiledJdbcMapper` 可以生成从 JDBC `ResultSet` 的列到 Java 对象的直接映射代码。它只负责**结果行映射**，不负责 SQL 执行、连接管理或事务处理。

目标类型包括 POJO、record、JOJO 和 `Map<String, Object>`。这一能力不同于 Java 对象之间的 [Object Mapping](/docs/mapping)。

## 快速开始 {#getting-started}

从普通 Java 类开始：

```java
class User {
    public String userName;
    public int age;

    public User() {}
}
```

声明单行、多行或 Prepared Row Mapping 方法：

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

对于前两个方法，调用时 `ResultSet` 必须位于**第一行之前**；生成代码会主动推进游标。

| 方法 | 行为 |
| --- | --- |
| `User user(ResultSet rs)` | 返回一条对象；结果为空时返回 `null`；默认在存在多行时失败 |
| `List<User> users(ResultSet rs)` | 将剩余结果行读入列表 |

如果单对象方法只需要返回第一行，可以配置 `@JdbcMappingOptions(singleResult = SingleResultPolicy.FIRST)`。

SJF4J **不会关闭**传入的 ResultSet，其生命周期仍由 JDBC 调用方负责。

## Prepared Row Mapping {#prepared-row-mapping}

如果已经有游标遍历循环，可以根据结果集元数据准备可复用的行映射器：

```java
JdbcRowMapper<User> rowMapper = mapper.prepare(rs.getMetaData());

while (rs.next()) {
    User user = rowMapper.map(rs);
    // Process the current row
}
```

`prepare()` 只解析一次列布局。返回的 `JdbcRowMapper<User>` 保存列下标与标签，但**不持有 ResultSet**。

`map(rs)` 只映射当前行，**不会推进或关闭游标**。Prepared Row Mapper 无状态，可在列布局相同的结果集之间复用。

## 列映射 {#column-mapping}

列标签可以自动匹配 Java 属性。例如，默认情况下 `user_name` 对应 `userName`。

| `ColumnNamingPolicy` | 匹配规则 |
| --- | --- |
| `EXACT` | 标签和大小写完全一致 |
| `INSENSITIVE` | 先尝试完全匹配，再尝试忽略大小写 |
| `INSENSITIVE_SNAKE` | 还支持 camelCase 与 snake_case 的转换匹配（**默认**） |

可以使用 `@Mapping` 覆盖个别列的映射：

```java
@CompiledJdbcMapper
interface LegacyUserMapper {
    @Mapping(target = "userName", source = "full_name")
    User user(ResultSet rs);
}
```

`@JdbcMappingOptions` 还提供方法级行为配置：

- `columnProjection = REQUIRE_ALL`（默认）要求映射的 POJO 属性都有对应列；`PRESENT_ONLY` 则让缺失的可变属性保持初始值。
- `singleResult = FAIL_ON_MULTIPLE`（默认）拒绝单对象方法遇到多行；`FIRST` 仅选择第一行。
- `columnNaming` 选择上表中的匹配策略。

同一命名匹配层级如果存在歧义，映射会明确失败。JDBC 映射还支持构造器 / record 目标，以及通过 `@MappingCreator` 自定义对象构造。

## 框架集成 {#framework-integration}

Prepared Row Mapper 可以与现有 JDBC 框架配合。例如使用 Spring `JdbcTemplate`：

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

Spring 负责执行查询和管理资源，SJF4J 负责映射结果行。通过 `sjf4j-spring` 或 Spring Boot Starter，`UserJdbcMapper` 可以直接使用 `@Autowired` 注入，无须手动调用 `CompiledInstances.create()`。参阅 [Spring Integration](/docs/spring-integration#spring-jdbc)。普通 JDBC 不依赖 Spring。

代码生成的启用方式参阅 [Installation](/docs/installation)。

## 性能 {#performance}

在 Customer Account POJO 基准负载中，生成的列表映射性能优于 Spring JDBC `BeanPropertyRowMapper` 和 MyBatis 自动映射。

具体参阅 [JDBC Result Mapping Benchmarks](/docs/benchmarks#jdbc-result-mapping) 与[完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/jdbc-mapping.md)。测试覆盖 ResultSet 遍历和对象实例化，**不包含 SQL 执行或网络 I/O**。

**API 参考（最新发布版本）：** [@CompiledJdbcMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/jdbc/CompiledJdbcMapper.html) · [JdbcRowMapper](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/mapping/JdbcRowMapper.html) · [@JdbcMappingOptions](https://javadoc.io/doc/org.sjf4j/sjf4j-core/latest/org/sjf4j/annotation/mapping/jdbc/JdbcMappingOptions.html)
