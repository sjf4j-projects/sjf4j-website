---
title: "Compliance & Benchmarks"
description: "Performance comparisons and independent standards-compliance projects."
---

# Compliance & Benchmarks

SJF4J is evaluated using JMH benchmarks and independent comparisons. This site provides an index and, later, concise result summaries. The main repository remains the source of truth for detailed measurements.

## JSON Binding

- [Java JSON Benchmark ↗](https://github.com/fabienrenaud/java-json-benchmark) — independent library benchmarks.
- [Binding Full Benchmarks](/docs/performance/binding) — native JSON libraries vs. SJF4J Runtime and Compiled.
- [Native Image Binding](/docs/performance/binding-native) — GraalVM comparisons.

## JSONPath Navigation

- [JSONPath Comparison ↗](https://cburgmer.github.io/json-path-comparison/) — compatibility comparison.
- [JSONPath Full Benchmarks](/docs/performance/path) — Jayway vs. SJF4J.

## JSON Schema Validation

- [Creek Service ↗](https://www.creekservice.org/json-schema-validation-comparison/) — independent JVM comparison.
- [Bowtie ↗](https://bowtie.report/) — JSON Schema compliance.
- [JSON Schema Full Benchmarks](/docs/performance/schema) — NetworkNT vs. SJF4J.

## Object Mapping

- [Java Object Mapper Benchmark ↗](https://github.com/arey/java-object-mapper-benchmark) — independent mapper comparison.
- [Object Mapping Full Benchmarks](/docs/performance/mapping) — MapStruct vs. SJF4J.

## JDBC Result Mapping

- [JDBC Result Mapping Full Benchmarks](/docs/performance/jdbc-mapping) — Spring JDBC, MyBatis, and SJF4J.

## Reproducibility

Every detailed benchmark page links to the current report in the main repository. Comparisons must be interpreted with their benchmark setup, versions, workloads, and units.
