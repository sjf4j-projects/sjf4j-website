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


## HTTP JSON and YAML (Spring MVC)

Spring MVC uses `HttpMessageConverter` for `@RequestBody` and response bodies. To use **SJF4J Runtime Binding** automatically, provide a converter in your application. No compiled binder or Controller changes are needed. This is an optional application-level integration; neither `sjf4j-spring` nor the Spring Boot starter installs a JSON converter.

### Dependencies

For Spring Boot 3.x, add Spring Web and the SJF4J backends you want:

```kotlin
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.sjf4j:sjf4j-core:{version}")
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("org.sjf4j:sjf4j-backend-snake:{version}")
implementation("org.yaml:snakeyaml:2.5")
```

Spring Boot 3's Web starter already supplies Jackson 2. For plain Spring Framework, use `spring-webmvc` and add the native Jackson dependency if needed. YAML requires both the SJF4J SnakeYAML adapter and SnakeYAML library. JSON can also use SJF4J's built-in Simple backend.

### Register in Spring Boot

**A single converter Bean is enough**: Spring Boot adds custom `HttpMessageConverter` Beans ahead of its default converters.

```java
@Configuration
class Sjf4jMvcConfig {

    @Bean
    Sjf4jHttpMessageConverter sjf4jHttpMessageConverter() {
        RuntimeContext context = new RuntimeContext(false);

        return new Sjf4jHttpMessageConverter(
                BinderFactory.jsonProvider().create(context),
                BinderFactory.yamlProvider().create(context));
    }
}
```

Change `RuntimeContext` or supply a specific `BinderProvider` to choose formats and backends. For example, replace `BinderFactory.jsonProvider()` with `new Jackson2BinderProvider()`. The `Sjf4jHttpMessageConverter` class below belongs to **your application**; it is not a built-in SJF4J class.

For **plain Spring MVC**, register the same converter through `WebMvcConfigurer.extendMessageConverters` instead:

```java
@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.add(0, sjf4jHttpMessageConverter);
}
```

### Converter implementation

::: details Sjf4jHttpMessageConverter.java

```java
public final class Sjf4jHttpMessageConverter
        extends AbstractGenericHttpMessageConverter<Object> {

    private final Binder<?, ?> json;
    private final Binder<?, ?> yaml;

    public Sjf4jHttpMessageConverter(
            Binder<?, ?> json, Binder<?, ?> yaml) {
        super(MediaType.APPLICATION_JSON,
              MediaType.parseMediaType("application/*+json"),
              MediaType.parseMediaType("application/yaml"));
        this.json = json;
        this.yaml = yaml;
    }

    @Override
    protected boolean supports(Class<?> type) {
        return type != String.class
                && type != byte[].class
                && !Resource.class.isAssignableFrom(type)
                && !ProblemDetail.class.isAssignableFrom(type);
    }

    @Override
    public Object read(Type type, Class<?> contextClass,
                       HttpInputMessage input) throws IOException {
        Type resolved = contextClass == null ? type
                : GenericTypeResolver.resolveType(type, contextClass);
        try {
            if (isYaml(input.getHeaders().getContentType())) {
                return yaml.readNode(new InputStreamReader(
                        input.getBody(), StandardCharsets.UTF_8), resolved);
            }
            return json.readNode(input.getBody(), resolved);
        } catch (BindingException e) {
            throw new HttpMessageNotReadableException(
                    "Cannot read request body", e, input);
        }
    }

    @Override
    protected Object readInternal(Class<?> type,
                                  HttpInputMessage input) throws IOException {
        return read(type, null, input);
    }

    @Override
    protected void writeInternal(Object value, Type type,
                                 HttpOutputMessage output) throws IOException {
        try {
            if (isYaml(output.getHeaders().getContentType())) {
                Writer writer = new OutputStreamWriter(
                        output.getBody(), StandardCharsets.UTF_8);
                yaml.writeNode(writer, value);
                writer.flush();
            } else {
                json.writeNode(output.getBody(), value);
            }
        } catch (BindingException e) {
            throw new HttpMessageNotWritableException(
                    "Cannot write response body", e);
        }
    }

    private static boolean isYaml(MediaType type) {
        return type != null && "application".equals(type.getType())
                && "yaml".equals(type.getSubtype());
    }
}
```

This example uses UTF-8 for YAML and supports `application/yaml`; add additional media types if your API requires them. Imports are omitted.

:::

### Use standard Controllers

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping(
        consumes = {"application/json", "application/yaml"},
        produces = {"application/json", "application/yaml"})
    public User save(@RequestBody User user) {
        return user;
    }
}
```

Spring selects the format using `Content-Type` and `Accept`. The converter handles `application/json` and `application/*+json` separately (the latter **does not** include `application/json`) and preserves generic types such as `List<User>` when reading.

This replaces **HTTP body binding only**, not Spring Boot's `application.yml` loader or Spring's validation mechanisms. SJF4J uses its own object-binding rules rather than Jackson's annotations and modules. If a read fails after SJF4J is selected, Spring does not retry with Jackson.

See [Binding](/docs/binding) and [Backends](/docs/backends) for supported types and backend selection.

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
