---
title: "FAQ"
description: "Frequently asked questions about SJF4J."
---

# FAQ

Short answers to common questions. More detailed technical information is provided in the feature guides.

## Is SJF4J a replacement for Jackson or Gson?

No. SJF4J provides a unified JSON-semantic structural layer and can use external JSON libraries as backends.

## Does SJF4J require a separate JSON tree?

No. Supported operations can work directly with native Java objects such as POJOs, Maps, and Lists.

## When should I use Compiled APIs?

Compiled APIs are useful where their supported operations and generated implementations fit the workload. They require annotation processing; runtime APIs remain available for flexible execution.

## What Java versions are supported?

SJF4J supports JDK 8 and newer.

## Where can I report an issue?

Use the [SJF4J issue tracker](https://github.com/sjf4j-projects/sjf4j/issues).
