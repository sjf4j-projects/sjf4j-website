---
title: "Modeling (OBNT)"
description: "Represent ordinary Java objects through JSON-semantic nodes."
---

# Modeling (OBNT)

**Object-Based Node Tree (OBNT)** is the shared structural model behind SJF4J.

## Node Kinds

| Kind | Typical Java representations |
| --- | --- |
| Object | `Map`, POJO, `JsonObject`, JOJO |
| Array | `List`, Java array, `JsonArray`, JAJO |
| Value | String, number, boolean, supported custom values |

## Structural Operations

The `Nodes` API provides operations for reading, modifying, traversing, and comparing supported structures.

## Typed and Extensible Models

This section will cover JOJO, JAJO, `@NodeObject`, `@NodeValue`, and `@OneOf`.

## Custom Node Types

ExternalNode adapters and their lifecycle will be documented here.
