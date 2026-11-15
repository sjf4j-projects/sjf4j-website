---
title: "Architecture"
description: "SJF4J architecture and the shared object-based node model."
---

# Architecture

SJF4J organizes multiple structural operations around one JSON-semantic object model.

## One Model, Many Capabilities

**OBNT (Object-Based Node Tree)** provides a shared structural view of native Java objects. Binding, navigation, patching, validation, and mapping can operate without mandatory conversion to a second JSON tree.

## Runtime and Compile-time

**Runtime APIs** prioritize flexibility. **Compiled APIs** generate Java implementations during annotation processing for supported operations. Both are exposed through the same overarching model.

## Backends and Data Formats

Input and output adapters include JSON library backends and YAML. Visit [Backends & Formats](/docs/backends) for the planned adapter guide.

## Design and Extension Points

Future content will cover the streaming Reader/Writer interfaces, RuntimeContext, ValueCodec, and ExternalNode integration.
