---
title: "性能基准"
description: "SJF4J 在数据绑定、导航、Schema 校验、对象映射、JDBC 映射和 GraalVM Native Image 下的性能测量。"
translationSourceSha: "33a1425c19f23d4fa6e6fca5b44547a61ce799e3"
---

# 性能基准 {#benchmarks}

<p class="benchmark-lead">
  运行时灵活，编译期高效——以实测数据为依据。
  本页展示有代表性的 JMH 对比；完整报告提供工作负载定义、绝对延迟、内存分配、源码和原始结果。
</p>

## 性能概览 {#performance-at-a-glance}

<BenchmarkHighlights />

## JVM 数据绑定 {#data-binding-on-the-jvm}

在 JVM 上，`@CompiledBinder` 会在编译期针对选定的 JSON 或 YAML 后端生成专用代码。以下图表比较 **100KB POJO 读取**，包括两种模型：**Users**（普通标量字段和嵌套对象）与 **Clients**（包含 UUID、日期时间、十进制数和枚举等类型化值）。

<div class="benchmark-bars-pair">

<BenchmarkBars
  comparison="Users POJO 读取 · 原生后端 / CompiledBinder · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 1.21 },
    { label: 'Jackson 3', speedup: 1.15 },
    { label: 'Fastjson2', speedup: 1.07 },
    { label: 'Gson', speedup: 1.17 },
    { label: 'SnakeYAML', speedup: 1.82 }
  ]"
/>

<BenchmarkBars
  comparison="Clients POJO 读取 · 原生后端 / CompiledBinder · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 3.13 },
    { label: 'Jackson 3', speedup: 3.23 },
    { label: 'Fastjson2', speedup: 1.04 },
    { label: 'Gson', speedup: 2.43 },
    { label: 'SnakeYAML', speedup: 1.86 }
  ]"
/>

</div>

对于较简单的 Users 模型，Compiled Binding 的表现接近原生后端；对于强类型的 Clients 模型，部分后端获得更明显的收益。实际结果取决于操作和模型。例如，Fastjson2 在 100KB Users POJO **写入**测试中的比值只有 **1.01×**。SnakeYAML 测量的是 YAML 而非 JSON，因此应在**同一后端内部**比较，而不是直接拿 JSON 和 YAML 的数据对比。完整测试还包括 Map、JSON-P、独立读写操作以及 1/10/100KB 的输入规模。

<small>v1.5.2-SNAPSHOT · Temurin 25 · JMH · 2026 年 11 月 17 日。比值均在各后端各自的 Runner Job 内计算。</small>

[数据绑定完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding.md)

## GraalVM Native Image 数据绑定 {#binding-on-graalvm-native-image}

Compiled Binding 也支持在 GraalVM **Native Image AOT 可执行程序**中运行。下面的串行 Native Image 基准，比较 Users 和 Clients 两种模型在 **100KB POJO 读取**中的表现，对照对象是第三方原生库直接绑定。

<div class="benchmark-bars-pair">

<BenchmarkBars
  comparison="Users POJO 读取 · 原生后端 / CompiledBinder · Native Image AOT · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 1.35 },
    { label: 'Jackson 3', speedup: 6.37 },
    { label: 'Fastjson2', speedup: 5.50 },
    { label: 'Gson', speedup: 1.15 }
  ]"
/>

<BenchmarkBars
  comparison="Clients POJO 读取 · 原生后端 / CompiledBinder · Native Image AOT · 100KB"
  :items="[
    { label: 'Jackson 2', speedup: 3.40 },
    { label: 'Jackson 3', speedup: 8.17 },
    { label: 'Fastjson2', speedup: 3.37 },
    { label: 'Gson', speedup: 2.56 }
  ]"
/>

</div>

Native Image 与上面的 JVM 基准使用不同的运行时及执行环境。这些比值仅比较**同一次 AOT 基准中的不同实现**，不能据此推断 JVM 与 Native Image 的相对速度。Map 类型的负载通常只有较小差距。

<small>v1.5.1-SNAPSHOT · GraalVM Community 25.5.5.0.3 · Native Image -O2 · 2026 年 11 月 11 日。每个测试案例运行 3 个独立的串行 Native 进程；数据来自托管 Runner，属于探索性结果。</small>

[GraalVM Native Image 完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/binding-native.md)

## JSONPath 导航 {#jsonpath-navigation}

SJF4J 可直接在 Map、List、JsonNode 和 POJO 上执行 JSONPath。对于 **100KB Map/List 输入**，下面五种查询形态中 CompiledNavigator 均快于 Jayway JsonPath。比较使用相同的已解析输入和可复用路径。

<BenchmarkBars
  comparison="Jayway JsonPath / CompiledNavigator · 100KB Map/List"
  :items="[
    { label: '直接查找', speedup: 23.17 },
    { label: '通配符', speedup: 8.52 },
    { label: '过滤器', speedup: 7.74 },
    { label: '后代选择', speedup: 6.01 },
    { label: '切片', speedup: 10.13 }
  ]"
/>

对于普通 POJO，直接编译式属性访问耗时 **2.74 ns/op**，而 SJF4J Runtime 为 **148.10 ns/op**，比值 **54.11×**。100KB POJO 的编译式过滤器比 Runtime 快 **7.17×**。在测量的测试集中，对于可比较的 Map/JsonNode 查询，Runtime 在 **30/30** 个案例中快于 Jayway；对于 Map/JsonNode/POJO 查询，Compiled 在 **45/45** 个案例中快于 Runtime。

<small>v1.5.3-SNAPSHOT · Temurin 25.0.5.1 · JMH · 2026 年 11 月 28 日。Map/List 和 JsonNode 使用 Intel Xeon 6975P-C，POJO 使用 AMD EPYC 7763。3 个独立 fork，取最快两个的均值；托管 Runner 探索性结果（PR #480，提交 857c5872）。查询执行不包含路径解析。</small>

[本次完整基准运行](https://github.com/sjf4j-projects/sjf4j/actions/runs/46130448820) · [历史基准与测试方法](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/path.md)

## JSON Schema 校验 {#json-schema-validation}

JSON Schema 可以直接校验 Java 对象，无须先构建中间 JSON 树。下图使用相同的预构建 Creek 测试数据，比较 `@CompiledValidator` 与 SJF4J Runtime 的**纯校验**性能。

<BenchmarkBars
  comparison="SJF4J Runtime / CompiledValidator · 仅校验"
  :items="[
    { label: 'POJO', speedup: 53.6 },
    { label: 'Map', speedup: 2.31 }
  ]"
/>

对于单独的 **Jackson2 JsonNode** 工作负载，SJF4J Runtime 比 NetworkNT 快 **2.41×**。没有对应的 NetworkNT POJO 或 Compiled JsonNode 测量结果，因此这些案例没有合并到图表中。

在往返测试中，**CompiledBinder + CompiledValidator** 完成序列化、反序列化和校验共需 **5.888 µs/op**；普通 Jackson2 仅完成序列化和反序列化（**不含校验**）需 **7.024 µs/op**。两者工作内容不同，此处用于说明编译式组合路径的表现，**不能视为等价校验任务的对照**。

<small>v1.5.0 · Temurin 25 · JMH · 2026 年 11 月 9 日 · JSON Schema Draft 2020-12。</small>

[JSON Schema 校验完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/schema.md)

## 对象映射 {#object-mapping}

对于普通 POJO 映射，`@CompiledMapper` 的性能通常**接近 MapStruct**；对于嵌套结构或集合密集型负载，部分场景更快。但这并不意味着它相比已经编译优化的 Mapper 能普遍获得数量级的加速。

<BenchmarkBars
  comparison="MapStruct / CompiledMapper · 典型对象映射"
  :items="[
    { label: 'Classic Order', speedup: 1.05 },
    { label: 'Extended Order · 100KB', speedup: 1.31 },
    { label: 'Flat POJO', speedup: 0.98 },
    { label: 'ArrayList · 100KB', speedup: 1.45 },
    { label: 'LinkedList · 100KB', speedup: 0.93 }
  ]"
/>

在多数成对测试中，内存分配量也基本一致。ArrayList 更能受益于生成的按索引遍历；LinkedList 则是 CompiledMapper 在实测中更慢的案例。扩展版 Order 测试包含嵌套 Bean、Map、JsonObject 和 List 的转换。

<small>v1.5.1-SNAPSHOT · Temurin 25 · JMH · 2026 年 11 月 12 日。映射测试不包含 JSON Binding 和 JDBC 工作。</small>

[对象映射完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/mapping.md)

## JDBC 结果映射 {#jdbc-result-mapping}

`@CompiledJdbcMapper` 通过可复用的预编译行 Mapper，生成从 ResultSet 到 Java 对象的直接映射。在 **12 列 Customer Account POJO** 测试数据中，其列表映射性能优于 Spring JDBC 的 `BeanPropertyRowMapper` 和 MyBatis 自动映射。

<BenchmarkBars
  comparison="框架 / CompiledJdbcMapper · POJO 列表"
  :items="[
    { label: 'Spring · 1,000 rows', speedup: 16.03 },
    { label: 'Spring · 100,000 rows', speedup: 15.92 },
    { label: 'MyBatis Auto · 1,000 rows', speedup: 7.34 },
    { label: 'MyBatis Auto · 100,000 rows', speedup: 7.37 }
  ]"
/>

完整测试还包括 **1、10 行**、record、Map、逐行映射、MyBatis 显式映射与游标。在 100,000 行时，相比 Spring 的 record 映射，SJF4J 的优势更大（**110.12×**），但这一结果仅针对该测试数据中的 `DataClassRowMapper`。

<small>v1.5.1-SNAPSHOT · Temurin 25 · JMH · 2026 年 11 月 13 日。包括 ResultSet 遍历与对象实例化，不包含 SQL 执行、连接建立或网络 I/O。</small>

[JDBC 结果映射完整基准报告](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/jdbc-mapping.md)

## 第三方基准与兼容性测试 {#independent-benchmarks}

主仓库是基准配置、完整延迟和内存分配表、原始 JMH 结果及可复现说明的权威来源。上面的六个**完整基准报告**链接直接指向这些数据。

以下则是**独立的第三方比较或规范兼容性项目**，不是本页加速比数据的来源：

- [Java JSON Benchmark](https://github.com/fabienrenaud/java-json-benchmark) — 跨 JSON 库的数据绑定对比。
- [JSONPath Comparison](https://cburgmer.github.io/json-path-comparison/) — JSONPath 实现兼容性。
- [Creek Service](https://www.creekservice.org/json-schema-validation-comparison/) — JVM JSON Schema 校验比较。
- [Bowtie](https://bowtie.report/) — JSON Schema 规范兼容性测试。
- [Java Object Mapper Benchmark](https://github.com/arey/java-object-mapper-benchmark) — Java 对象映射框架比较。
