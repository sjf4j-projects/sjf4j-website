---
title: "Object Mapping"
description: "Runtime object conversion and compile-time generated mappers."
---

# Object Mapping

Map and transform Java object graphs, including DTO projections and nested models.

## Runtime Mapping

Use `Sjf4j.convert()` to convert between supported structures.

## Compiled Mapping

Use `@CompiledMapper` for generated mappings. This section will cover renamed properties, nested mappings, mapping methods, and creation strategies.

## Update and Conversion Rules

A dedicated section will describe source and target null handling, update mappings, and assignment/conversion policies.

## Performance

See [Object Mapping benchmarks](/docs/performance/mapping).
