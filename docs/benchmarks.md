---
title: "Benchmarks"
description: "Measured SJF4J performance across data binding, navigation, schema validation, object mapping, JDBC mapping, and GraalVM Native Image."
---

# Benchmarks

<p class="benchmark-lead">
  Runtime flexibility, compiled speed — backed by measured results.
  Explore representative JMH comparisons here, then follow the full reports for
  workload definitions, absolute latency, allocation, source code, and raw results.
</p>

## Performance at a Glance

<BenchmarkHighlights />

## Data Binding

On the JVM, `@CompiledBinder` specializes the selected JSON or YAML backend
at compile time. The following charts compare **100KB POJO reads** on two models:
**Users** (ordinary scalar fields and nested objects) and **Clients** (typed
values including UUIDs, date/time types, decimals, and enums).

<BenchmarkBars
  comparison="Users POJO Read · Direct backend / CompiledBinder · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 1.16 },
    { label: 'Jackson 3', speedup: 1.09 },
    { label: 'Fastjson2', speedup: 1.06 },
    { label: 'Gson', speedup: 1.22 },
    { label: 'SnakeYAML', speedup: 1.42 }
  ]"
/>

<BenchmarkBars
  comparison="Clients POJO Read · Direct backend / CompiledBinder · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 3.57 },
    { label: 'Jackson 3', speedup: 3.77 },
    { label: 'Fastjson2', speedup: 1.04 },
    { label: 'Gson', speedup: 2.41 },
    { label: 'SnakeYAML', speedup: 1.53 }
  ]"
/>

Compiled Binding stays close to direct backend performance on the simpler
Users model, with larger gains on strongly typed Clients for some backends.
Results depend on the operation and model: for example, 100KB Users POJO
writes on Fastjson2 measure **0.99×** against direct binding. SnakeYAML
measures YAML rather than JSON; compare implementations within each backend,
not JSON against YAML. The full suite also covers Maps, JSON-P, separate
reads/writes, and 1/10/100KB inputs.

<small>v1.5.1-SNAPSHOT · Temurin 25 · JMH · November 13, 2026. Ratios compare each backend within its own runner job.</small>

[Data Binding Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding.md)

## GraalVM Native Image Binding

Compiled binding also runs in GraalVM **Native Image AOT executables**.
The serial Native Image benchmark compares **100KB POJO reads** for both
Users and Clients against direct third-party library binding.

<BenchmarkBars
  comparison="Users POJO Read · Direct backend / CompiledBinder · Native Image AOT · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 1.35 },
    { label: 'Jackson 3', speedup: 6.37 },
    { label: 'Fastjson2', speedup: 5.50 },
    { label: 'Gson', speedup: 1.15 }
  ]"
/>

<BenchmarkBars
  comparison="Clients POJO Read · Direct backend / CompiledBinder · Native Image AOT · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 3.40 },
    { label: 'Jackson 3', speedup: 8.17 },
    { label: 'Fastjson2', speedup: 3.37 },
    { label: 'Gson', speedup: 2.56 }
  ]"
/>

Native Image uses a different runtime and execution environment from the
JVM measurements above. These ratios compare implementations **within the
same AOT benchmark**, not JVM speed against Native Image speed. Map workloads
typically show much smaller differences.

<small>v1.5.1-SNAPSHOT · GraalVM Community 25.5.5.0.3 · Native Image -O2 · November 11, 2026. Three serial native processes per case; exploratory hosted-runner results.</small>

[GraalVM Native Image Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding-native.md)

## JSONPath Navigation

SJF4J executes JSONPath queries directly on Maps, Lists, JsonNodes, and POJOs.
For **100KB Map/List inputs**, CompiledNavigator is faster than Jayway JsonPath
across these five query shapes, with the same pre-parsed input and reusable paths.

<BenchmarkBars
  comparison="Jayway JsonPath / CompiledNavigator · 100KB Map/List"
  :items="[
    { label: 'Direct lookup', speedup: 27.23 },
    { label: 'Wildcard', speedup: 9.72 },
    { label: 'Filter', speedup: 6.56 },
    { label: 'Descendant', speedup: 4.59 },
    { label: 'Slice', speedup: 11.90 }
  ]"
/>

On ordinary POJOs, a direct compiled property lookup takes **2.75 ns/op**
versus **151.83 ns/op** for SJF4J Runtime (**55.31×**). Complex filters
have smaller gains. In the measured suite, Runtime beat Jayway in **30/30**
comparable Map/JsonNode queries, and Compiled beat Runtime in **45/45**
Map/JsonNode/POJO queries.

<small>v1.5.0 · Temurin 25 · JMH · November 11, 2026. Query execution excludes path parsing; the Jayway comparison above is for Map/List inputs, not POJO inputs.</small>

[JSONPath Navigation Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/path.md)

## JSON Schema Validation

JSON Schema validation can operate directly on Java objects without first
materializing an intermediate JSON tree. The following compares
`@CompiledValidator` against SJF4J Runtime on the same prebuilt Creek fixtures.

<BenchmarkBars
  comparison="SJF4J Runtime / CompiledValidator · validation only"
  :items="[
    { label: 'POJO', speedup: 53.6 },
    { label: 'Map', speedup: 2.31 }
  ]"
/>

For the separate **Jackson2 JsonNode** workload, SJF4J Runtime is **2.41×**
faster than NetworkNT. No comparable NetworkNT POJO or compiled JsonNode
result was measured, so those cases are not combined into the chart.

In the roundtrip test, **CompiledBinder + CompiledValidator** completes
serialization, deserialization, and validation in **5.888 µs/op**,
versus **7.024 µs/op** for plain Jackson2 serialization and deserialization
*without validation*. These are distinct workloads; the comparison is shown
to illustrate the combined compiled path, not to claim equivalent validation work.

<small>v1.5.0 · Temurin 25 · JMH · November 9, 2026 · JSON Schema Draft 2020-12.</small>

[JSON Schema Validation Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/schema.md)

## Object Mapping

`@CompiledMapper` is generally **close to MapStruct** on ordinary POJO mapping
and can be faster on nested or collection-heavy workloads. It is not intended
to imply an order-of-magnitude speedup over an already compiled mapper.

<BenchmarkBars
  comparison="MapStruct / CompiledMapper · representative object mappings"
  :items="[
    { label: 'Classic Order', speedup: 1.05 },
    { label: 'Extended Order · 100KB', speedup: 1.31 },
    { label: 'Flat POJO', speedup: 0.98 },
    { label: 'ArrayList · 100KB', speedup: 1.45 },
    { label: 'LinkedList · 100KB', speedup: 0.93 }
  ]"
/>

The same test suite reports near-identical allocation in most paired
workloads. ArrayList benefits more from generated indexed traversal, while
LinkedList is a measured case where CompiledMapper is slower. The extended
Order workload exercises nested Beans, Maps, JsonObjects, and list conversion.

<small>v1.5.1-SNAPSHOT · Temurin 25 · JMH · November 12, 2026. Mapping excludes JSON binding and JDBC work.</small>

[Object Mapping Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/mapping.md)

## JDBC Result Mapping

`@CompiledJdbcMapper` generates direct ResultSet-to-object mapping with a
prepared, reusable row mapper. On the **12-column Customer Account POJO**
fixture, its list-mapping path is faster than Spring JDBC's
`BeanPropertyRowMapper` and MyBatis automatic mapping.

<BenchmarkBars
  comparison="Framework / CompiledJdbcMapper · POJO List"
  :items="[
    { label: 'Spring · 1,000 rows', speedup: 16.03 },
    { label: 'Spring · 100,000 rows', speedup: 15.92 },
    { label: 'MyBatis Auto · 1,000 rows', speedup: 7.34 },
    { label: 'MyBatis Auto · 100,000 rows', speedup: 7.37 }
  ]"
/>

The full benchmark also covers **1 and 10 rows**, records, Maps, row-by-row
mapping, and MyBatis explicit mappings and cursors. At 100,000 rows, Spring
Record mapping shows a much larger advantage for SJF4J (**110.12×**), but
that result is specific to `DataClassRowMapper` on this fixture.

<small>v1.5.1-SNAPSHOT · Temurin 25 · JMH · November 13, 2026. Includes ResultSet traversal and object materialization; excludes SQL execution, connection setup, and network I/O.</small>

[JDBC Result Mapping Benchmarks ↗](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/jdbc-mapping.md)

## Independent Benchmarks

The main repository is the source of truth for benchmark configuration,
complete latency and allocation tables, raw JMH results, and reproducibility
notes. The six **Benchmarks** links above lead directly to those reports.

For additional context, the following are **separate third-party comparison
and compliance projects**, not the sources of the speedup figures on this page:

- [Java JSON Benchmark ↗](https://github.com/fabienrenaud/java-json-benchmark) — cross-library JSON binding.
- [JSONPath Comparison ↗](https://cburgmer.github.io/json-path-comparison/) — JSONPath implementation compatibility.
- [Creek Service ↗](https://www.creekservice.org/json-schema-validation-comparison/) — JVM JSON Schema validation comparisons.
- [Bowtie ↗](https://bowtie.report/) — JSON Schema specification compliance.
- [Java Object Mapper Benchmark ↗](https://github.com/arey/java-object-mapper-benchmark) — object-mapping frameworks.
