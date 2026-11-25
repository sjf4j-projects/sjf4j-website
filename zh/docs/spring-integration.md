---
title: "Spring 集成"
description: "通过自动 Bean 注册，在 Spring Framework 和 Spring Boot 中使用 SJF4J Compiled API。"
translationSourceSha: "960403d0d468831c5a14ec31e9e3a7446a9b4c11"
---

# Spring 集成 {#spring-integration}

SJF4J 可以将生成的接口注册为普通 Spring Bean。在 **Spring Framework** 中，通过 `@EnableSjf4j` 启用一次；在 **Spring Boot** 中，Starter 会自动启用相同的集成。不需要为生成类添加 Spring 注解，也不必手动调用 `CompiledInstances.create()`。

自动集成要求 **Spring Framework 6.2+（Java 17+）** 或 **Spring Boot 3.x（Java 17+）**。不依赖 Spring 的 SJF4J Core 仍支持 Java 8+。

## 安装 {#installation}

### Spring Framework（不使用 Boot） {#spring-framework-without-boot}

添加 `sjf4j-spring` 和注解处理器：

::: code-group

```kotlin [Gradle (Kotlin DSL)]
implementation("org.sjf4j:sjf4j-spring:{version}")
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j-spring</artifactId>
    <version>{version}</version>
</dependency>
```

:::

在 Spring 配置中启用 SJF4J：

```java
@Configuration
@EnableSjf4j
public class AppConfig {
}
```

应用原有的 Spring 组件扫描和 Bean 配置不受影响。SJF4J 通过生成的索引注册编译式接口，而不依赖扫描这些接口所在的包。

### Spring Boot {#spring-boot}

添加 Starter 和注解处理器。Starter 会自动启用注册，**无需 `@EnableSjf4j`**：

::: code-group

```kotlin [Gradle (Kotlin DSL)]
implementation("org.sjf4j:sjf4j-spring-boot-starter:{version}")
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")
```

```xml [Maven]
<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j-spring-boot-starter</artifactId>
    <version>{version}</version>
</dependency>
```

:::

两种集成模块都会通过传递依赖引入 `sjf4j-core`。使用 Maven 时，还需要[单独配置注解处理器](/docs/installation#compiled-apis)。版本选择、可选后端和 Schema 依赖参阅[安装指南](/docs/installation)。

## 自动注册 Bean {#automatic-bean-registration}

定义一个编译式接口：

```java
@CompiledMapper
public interface UserMapper {
    UserDto toDto(User user);
}
```

在 Spring Service 中注入：

```java
@Service
public class UserService {

    @Autowired
    private UserMapper mapper;

    public UserDto convert(User user) {
        return mapper.toDto(user);
    }
}
```

所有五类 Compiled API 都支持这种方式：

| 注解 | Spring 管理的功能 |
| --- | --- |
| `@CompiledMapper` | Java 对象映射 |
| `@CompiledNavigator` | JSONPath / JSON Pointer 导航 |
| `@CompiledBinder` | 生成的数据绑定 |
| `@CompiledJdbcMapper` | JDBC 结果映射 |
| `@CompiledValidator` | JSON Schema 校验 |

注解处理器在编译期生成 `_Impl` 类以及 `META-INF/sjf4j/compiled.interfaces`。应用启动时，Spring 集成会读取类路径上的这些索引（包括依赖 JAR 中的索引），注册为**延迟初始化的单例 Bean**。如果显式定义了相同接口的 Bean，则显式定义优先，即使它是 prototype Bean。

不需要扫描生成类所在的包，也不需要在生成类上添加 Spring 注解。

## 自定义集成 {#custom-integration}

如果使用不同版本的 Spring，或希望自行控制 Bean 注册，可以不依赖 `sjf4j-spring` 和 `sjf4j-spring-boot-starter`。使用应用自己的 Spring 依赖、`sjf4j-core`、注解处理器及所需的 SJF4J 模块即可。

将 Compiled API 接口显式注册为 Spring Bean：

```java
@Configuration
public class MySjf4jConfig {

    @Bean
    public UserMapper userMapper() {
        return CompiledInstances.create(UserMapper.class);
    }
}
```

如果需要自定义自动注册机制，可以读取类路径上的 `META-INF/sjf4j/compiled.interfaces`，将索引中的接口注册为 Bean。参考 [CompiledBeanDefinitionRegistrar.java](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-spring/src/main/java/org/sjf4j/spring/CompiledBeanDefinitionRegistrar.java)，并根据自己的 Spring 版本进行适配。

## Spring Converter {#spring-converter}

Compiled Mapper 可以实现 Spring 标准的 `Converter<S, T>` 接口：

```java
@CompiledMapper
public interface CarMapper extends Converter<Car, CarDto> {

    @Override
    @Mapping(target = "seats", source = "seatConfiguration")
    CarDto convert(Car car);
}
```

两种 Spring 集成方式都能直接注入 `CarMapper`。在 Spring Boot MVC 应用中，MVC 还会发现 `Converter` Bean 并将其注册到 MVC 的转换服务中：

```java
@Autowired
@Qualifier("mvcConversionService")
private ConversionService conversionService;

// In a service method:
CarDto dto = conversionService.convert(car, CarDto.class);
```

自定义的 `ConversionService` 不保证自动包含这些 Converter。目前 SJF4J 不会将嵌套的 Compiled Mapping 委托给 Spring `ConversionService`。

不依赖框架的映射 API 参阅 [Object Mapping](/docs/mapping)。

## Spring JDBC {#spring-jdbc}

`@CompiledJdbcMapper` 可以直接与 Spring `JdbcTemplate` 配合使用，但它本身不执行 SQL，也不管理 JDBC 资源。

```java
@CompiledJdbcMapper
public interface UserJdbcMapper {
    List<User> users(ResultSet rs);
}
```

将 Mapper 和 `JdbcTemplate` 注入 Repository：

```java
@Repository
public class UserRepository {

    @Autowired
    private UserJdbcMapper mapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<User> findAll() {
        return jdbcTemplate.query(
                "SELECT id, name FROM users", mapper::users);
    }
}
```

这里生成的 Mapper 直接作为 `ResultSetExtractor` 使用。Spring 负责连接、SQL 执行和资源管理，SJF4J 负责消费和映射 `ResultSet`。使用此示例还需要 Spring JDBC 依赖，例如 `spring-boot-starter-jdbc`。

如果要使用可复用列下标的预编译行映射器，参阅 [JDBC Result Mapping](/docs/jdbc-mapping#prepared-row-mapping)。

## HTTP JSON 与 YAML（Spring MVC） {#http-json-and-yaml-spring-mvc}

在 Spring MVC 中，可以通过自定义 `HttpMessageConverter` 使用 SJF4J 处理 JSON/YAML 请求体和响应体。Spring Boot 可直接注册为 Bean；纯 Spring MVC 则通过 `WebMvcConfigurer.extendMessageConverters()` 添加。

参阅可运行的 [Sjf4jHttpMessageConverter](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-spring/src/test/java/org/sjf4j/spring/example/Sjf4jHttpMessageConverter.java) 和对应[测试](https://github.com/sjf4j-projects/sjf4j/blob/main/sjf4j-spring/src/test/java/org/sjf4j/spring/example/Sjf4jHttpMessageConverterTest.java)。YAML 需要 [SnakeYAML 后端](/docs/installation#backends)。

**注意：** SJF4J 有独立的数据绑定语义，未必与 Jackson 完全兼容。参阅 [Binding](/docs/binding)。

## 配置与限制 {#configuration-limitations}

存在 Spring 管理的 `NodeConfig` Bean 时，生成的实例会使用它；否则使用 `NodeConfig.DEFAULT`。

```java
@Configuration
class Sjf4jConfig {

    @Bean
    NodeConfig nodeConfig() {
        return new NodeConfig(false); // Exclude null-valued members
    }
}
```

两种集成都支持常规 Spring 注入、`ObjectProvider`、集合注入及 Bean 后置处理。

**当前限制：**

- 生成的实现类是 `final`。如果需要对这些 Bean 使用 Spring AOP，应采用基于接口的 JDK 动态代理（例如 `spring.aop.proxy-target-class=false`），而不是通过 CGLIB 继承代理。
- `@CompiledMapper(importing = ...)` 会在内部创建被导入的 Mapper，它们不会与 Spring 管理的 Bean 共享实例。
- 当前集成尚不支持 Spring AOT 和 GraalVM Native Image。
- 这两种集成均不会自动替换 Spring MVC 的 JSON `HttpMessageConverter` 或 Spring 的校验框架。

实现细节参阅 [Spring Framework 集成](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-spring) 和 [Spring Boot Starter](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-spring-boot-starter)。
