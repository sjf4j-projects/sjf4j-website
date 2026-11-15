---
title: "JDBC Result Mapping"
description: "Map JDBC ResultSet rows to Java objects with CompiledJdbcMapper."
---

# JDBC Result Mapping

JDBC result mapping is a dedicated compile-time feature, separate from general object-to-object mapping.

## Overview

`@CompiledJdbcMapper` generates direct mappings from `ResultSet` to Java models.

## Minimal Example

```java
@CompiledJdbcMapper
interface UserJdbcMapper {
    List<User> users(ResultSet resultSet);
}
```

## Mapping Modes

Future content will cover single-row and multiple-row mappings, column-to-property matching, and type conversions.

## Performance

See [JDBC Result Mapping benchmarks](/docs/performance/jdbc-mapping).
