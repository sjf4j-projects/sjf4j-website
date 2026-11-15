---
title: "Validating"
description: "JSON Schema validation through runtime and compiled APIs."
---

# Validating

SJF4J validates supported Java object graphs using JSON Schema semantics.

## Supported Drafts

Draft 2020-12, 2019-09, and 7 are supported. Draft-specific behavior and limitations will be documented here.

## Runtime Validation

This section will explain schema loading, compilation, validation results, and detailed errors.

## Compiled Validation

Use `@CompiledValidator` to generate optimized validators. Future details will include external schema references and fallback behavior.

## Annotation and Compliance

Annotation collection and references to [Bowtie](https://bowtie.report/) belong here.

## Performance

See [JSON Schema Validation benchmarks](/docs/performance/schema).
