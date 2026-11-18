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

Spring MVC uses `HttpMessageConverter` for `@RequestBody` and response bodies. To use SJF4J automatically for these operations, register a **generic MVC message converter**. This is an application-side adapter: the current `sjf4j-spring` / Boot starter does **not** register one automatically. No Controller-specific Binder or annotation processor is required.

Use `spring-boot-starter-web` (or Spring MVC) and add the JSON and YAML backend adapters and their libraries. Spring Boot's dependency management may already provide the native libraries:

```kotlin
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("org.sjf4j:sjf4j-backend-snake:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")
implementation("org.yaml:snakeyaml:2.5")
```

### Message converter

Implement a converter that delegates JSON and YAML directly to SJF4J's runtime streaming binders. The example targets Spring Framework 6.2+; imports are omitted.

```java
public final class Sjf4jHttpMessageConverter
        extends AbstractGenericHttpMessageConverter<Object> {

    private final Binder<?, ?> json =
            BinderFactory.jsonProvider().create(RuntimeContext.EMPTY);
    private final Binder<?, ?> yaml =
            BinderFactory.yamlProvider().create(RuntimeContext.EMPTY);

    public Sjf4jHttpMessageConverter() {
        super(MediaType.APPLICATION_JSON,
                MediaType.parseMediaType("application/*+json"),
                MediaType.parseMediaType("application/yaml"),
                MediaType.parseMediaType("application/x-yaml"),
                MediaType.parseMediaType("text/yaml"));
    }

    @Override
    protected boolean supports(Class<?> type) {
        // Leave special HTTP responses to Spring's built-in converters.
        return type != String.class
                && type != byte[].class
                && !Resource.class.isAssignableFrom(type)
                && !ProblemDetail.class.isAssignableFrom(type);
    }

    @Override
    public Object read(Type type, Class<?> contextClass,
                       HttpInputMessage input) throws IOException {
        Type target = contextClass == null ? type
                : GenericTypeResolver.resolveType(type, contextClass);
        try {
            if (isYaml(input.getHeaders().getContentType())) {
                Reader reader = new InputStreamReader(
                        input.getBody(), StandardCharsets.UTF_8);
                return yaml.readNode(reader, target);
            }
            return json.readNode(input.getBody(), target);
        } catch (RuntimeException e) {
            throw new HttpMessageNotReadableException(
                    "SJF4J could not read request body", e, input);
        }
    }

    @Override
    protected Object readInternal(Class<? extends Object> type,
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
        } catch (RuntimeException e) {
            throw new HttpMessageNotWritableException(
                    "SJF4J could not write response body", e);
        }
    }

    private static boolean isYaml(MediaType type) {
        return type != null && (
                "yaml".equals(type.getSubtype())
                || "x-yaml".equals(type.getSubtype()));
    }
}
```

Register the converter **before Jackson's JSON converter**, while preserving the other Spring converters:

```java
@Configuration
public class Sjf4jMvcConfig implements WebMvcConfigurer {

    @Override
    public void extendMessageConverters(
            List<HttpMessageConverter<?>> converters) {

        HttpMessageConverter<?> sjf4j = new Sjf4jHttpMessageConverter();
        for (int i = 0; i < converters.size(); i++) {
            if (converters.get(i)
                    instanceof MappingJackson2HttpMessageConverter) {
                converters.add(i, sjf4j);
                return;
            }
        }
        converters.add(sjf4j);
    }
}
```

Controllers now use ordinary Spring MVC annotations for **both formats**:

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

Spring selects the format from `Content-Type` and `Accept`. Generic request targets such as `List<User>` retain their `Type`. This adapter handles HTTP bodies, **not** query parameters or form binding. As a general-purpose converter it should be tested against your DTOs before replacing Jackson: SJF4J has its own annotation and binding semantics, and a failed read does not trigger a second attempt with Jackson. Keep Spring's specialized string, resource, and binary handling in place.

### Spring Boot YAML configuration

Spring Boot loads `application.yml` and `application-{profile}.yml` **before Spring Beans are created**. An `@Bean` or MVC converter cannot change this. Boot's `PropertySourceLoader` is discovered through `META-INF/spring.factories`, so it can be used to install SJF4J at the configuration-loading stage.

For applications with **single-document YAML files using JSON-compatible structures**, a loader can parse through SJF4J and flatten the resulting map into Spring property keys:

```java
@Order(Ordered.HIGHEST_PRECEDENCE)
public final class Sjf4jYamlPropertySourceLoader
        implements PropertySourceLoader {

    private final Binder<?, ?> yaml =
            BinderFactory.yamlProvider().create(RuntimeContext.EMPTY);

    @Override
    public String[] getFileExtensions() {
        return new String[]{"yml", "yaml"};
    }

    @Override
    public List<PropertySource<?>> load(
            String name, Resource resource) throws IOException {

        Map<String, Object> flat = new LinkedHashMap<>();
        try (Reader reader = new InputStreamReader(
                resource.getInputStream(), StandardCharsets.UTF_8)) {
            Object root = yaml.readNode(reader, Map.class);
            flatten("", root, flat);
        }
        return List.of(new MapPropertySource(name, flat));
    }

    private static void flatten(
            String path, Object value, Map<String, Object> result) {

        if (value instanceof Map<?, ?> map) {
            map.forEach((key, child) -> flatten(
                    path.isEmpty() ? key.toString() : path + "." + key,
                    child, result));
        } else if (value instanceof List<?> list) {
            for (int i = 0; i < list.size(); i++) {
                flatten(path + "[" + i + "]", list.get(i), result);
            }
        } else if (!path.isEmpty()) {
            result.put(path, value);
        }
    }
}
```

Register it in `src/main/resources/META-INF/spring.factories`:

```properties
org.springframework.boot.env.PropertySourceLoader=com.example.Sjf4jYamlPropertySourceLoader
```

Replace `com.example` with your class package. Spring loads the ordered property-source loaders during bootstrap; there is no need to annotate your application class. This requires `sjf4j-backend-snake` and SnakeYAML on the startup classpath.

**Important limitation:** this minimal loader is **not a drop-in replacement** for Boot's full YAML configuration support. SJF4J's current SnakeYAML binder accepts one YAML document and rejects anchors/aliases and non-JSON-compatible tags. The example also does not reproduce Boot's full multi-document handling or per-property origin tracking. Applications using `---`, profile-activated documents, or advanced Spring Boot configuration features should retain Boot's default YAML loader until a dedicated, compatibility-tested SJF4J adapter is available.

For the underlying format APIs, see [Binding](/docs/binding) and [Backends](/docs/backends).

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
