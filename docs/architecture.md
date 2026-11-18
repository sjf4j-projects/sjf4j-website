---
title: "Architecture"
description: "How SJF4J unifies JSON-oriented operations over Java objects."
---

# Architecture

SJF4J exposes JSON-semantic structural operations over ordinary Java objects, without requiring conversion into an intermediate JSON tree.

## Shared Object Model

**OBNT (Object-Based Node Tree)** provides the structural view shared by binding, navigation, validation, patching, and mapping. It supports POJOs, Maps, Lists, SJF4J containers, and compatible external node models.

See [Modeling (OBNT)](/docs/modeling) for the object model, property access, and custom value types.

## Runtime and Compiled APIs

Runtime APIs support dynamic operations. Compiled APIs generate specialized Java implementations for supported statically declared operations.

See [Compiled APIs](/docs/compiled) for the generation model and its limits.

## Backends and Extensions

Streaming adapters integrate JSON and YAML backends, while external-node adapters expose native in-memory JSON trees.

See [Backends & Formats](/docs/backends) for streaming integration and [External Nodes](/docs/external-nodes) for native object models.
