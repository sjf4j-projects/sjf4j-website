---
title: "Spring Integration"
description: "Integrate compiled SJF4J APIs with Spring Framework or Spring Boot using automatic Bean registration."
---

# Spring Integration

SJF4J registers its generated interfaces as ordinary Spring Beans. With **Spring Framework**, enable registration once using `@EnableSjf4j`. With **Spring Boot**, the starter enables the same integration automatically. No annotations on the generated implementations or manual `CompiledInstances.create()` calls are needed.

Requires **Spring Framework 6.2+ (Java 17+)** or **Spring Boot 3.x (Java 17+)**. The framework-independent SJF4J core still supports Java 8+.

## Installation

### Spring Framework (without Boot)

Add `sjf4j-spring` and the annotation processor:

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

Enable SJF4J once in your Spring configuration:

```java
@Configuration
@EnableSjf4j
public class AppConfig {
}
```

Existing Spring component scanning or Bean configuration still controls your application services; SJF4J registers compiled interfaces from its generated index, without scanning their packages.

### Spring Boot

Add the starter and annotation processor. The starter enables the same registration **without `@EnableSjf4j`**:

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

Both integration artifacts include `sjf4j-core` transitively. With Maven, [configure annotation processing](/docs/installation#compiled-apis) separately. See [Installation](/docs/installation) for version selection, optional backends, and schema dependencies.

## Automatic Bean Registration

Define a compiled interface:

```java
@CompiledMapper
public interface UserMapper {
    UserDto toDto(User user);
}
```

Inject it in a Spring service:

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

This works for all five compiled API families:

| Annotation | Spring-managed API |
| --- | --- |
| `@CompiledMapper` | Java object mapping |
| `@CompiledNavigator` | JSONPath / JSON Pointer navigation |
| `@CompiledBinder` | Generated data binding |
| `@CompiledJdbcMapper` | JDBC result mapping |
| `@CompiledValidator` | JSON Schema validation |

At compilation, the annotation processor generates `_Impl` classes and `META-INF/sjf4j/compiled.interfaces`. At startup, the shared Spring integration reads these indexes from the classpath (including dependency JARs), then registers **lazy singleton** Bean definitions. An explicitly declared Bean of the same interface takes precedence, including prototype Beans.

No package scanning or Spring annotations on generated classes are required.

## Spring Converter

A compiled mapper can implement Spring's standard `Converter<S, T>` interface:

```java
@CompiledMapper
public interface CarMapper extends Converter<Car, CarDto> {

    @Override
    @Mapping(target = "seats", source = "seatConfiguration")
    CarDto convert(Car car);
}
```

You can inject `CarMapper` directly in either Spring setup. In a Spring Boot MVC application, MVC also discovers `Converter` Beans and registers them in its own conversion service:

```java
@Autowired
@Qualifier("mvcConversionService")
private ConversionService conversionService;

// In a service method:
CarDto dto = conversionService.convert(car, CarDto.class);
```

A custom `ConversionService` is not automatically guaranteed to contain these converters. SJF4J does not currently delegate nested compiled mappings to a Spring `ConversionService`.

See [Object Mapping](/docs/mapping) for the framework-independent mapping APIs.

## Spring JDBC

`@CompiledJdbcMapper` also works directly with Spring's `JdbcTemplate`. It does not execute SQL or manage JDBC resources.

```java
@CompiledJdbcMapper
public interface UserJdbcMapper {
    List<User> users(ResultSet rs);
}
```

Inject the mapper and `JdbcTemplate` into a repository:

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

This uses the generated mapper directly as a `ResultSetExtractor`. Spring manages connections and SQL execution; SJF4J consumes and maps the `ResultSet`. Applications using this example also need Spring JDBC (for example, `spring-boot-starter-jdbc`).

For prepared row mapping with reusable column indexes, see [JDBC Result Mapping](/docs/jdbc-mapping#prepared-row-mapping).

## Configuration & Limitations

A Spring-managed `RuntimeContext` Bean is used by generated instances when available; otherwise they use `RuntimeContext.EMPTY`.

```java
@Configuration
class Sjf4jConfig {

    @Bean
    RuntimeContext runtimeContext() {
        return new RuntimeContext(false); // Exclude null-valued members
    }
}
```

Both integrations support ordinary Spring injection, `ObjectProvider`, collections, and Bean post-processing.

**Current limits:**

- Generated implementations are `final`. Spring AOP on these Beans requires interface-based JDK proxies (for example, `spring.aop.proxy-target-class=false`), not CGLIB subclass proxies.
- `@CompiledMapper(importing = ...)` creates imported mappers internally; those instances are not shared with Spring-managed Beans.
- Spring AOT and GraalVM Native Image are not yet supported by these integrations.
- Neither integration replaces Spring MVC's JSON `HttpMessageConverter` or Spring's validation infrastructure.

For implementation details, see the [Spring Framework integration](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-spring) and [Spring Boot Starter](https://github.com/sjf4j-projects/sjf4j/tree/main/sjf4j-spring-boot-starter).
