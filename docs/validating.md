---
title: "Validating"
description: "Validate Java objects against JSON Schema with Runtime and Compiled APIs."
---

# Validating

SJF4J validates Java objects directly against **JSON Schema**, without serializing them or building intermediate JSON trees. It supports **Draft 2020-12, 2019-09, and 7**, with flexible Runtime validation and generated Compiled validators.

Validation works with POJOs, Maps, Lists, SJF4J nodes, and supported [external node models](/docs/external-nodes).

## Getting Started

Use an ordinary Java object:

```java
class User {
    public String name;
    public int age;
}
```

Define a schema in `src/main/resources/schemas/user.json`. Both examples below use this file:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "description": "A user record",
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}
```

Add `sjf4j-schema` for Runtime validation and `sjf4j-processor` on the annotation processor path for Compiled validation. See [Installation](/docs/installation) for Gradle and Maven.

## Runtime Validation

Parse a JSON Schema once, create a reusable `SchemaPlan`, and validate Java objects directly. Here, `schemaJson` contains the JSON above:

```java
SchemaPlan plan = JsonSchema.fromJson(schemaJson).createPlan();

User user = new User();
user.name = "Alice";
user.age = 18;

boolean valid = plan.isValid(user);
ValidationResult result = plan.validate(user);
plan.requireValid(user);
```

Choose the result you need:

| API | Behavior |
| --- | --- |
| `isValid(value)` | Fast, fail-fast boolean check |
| `validate(value)` | Collect validation errors |
| `requireValid(value)` | Throw `ValidationException` on failure |

### Errors and annotations

`ValidationResult` reports the failed keyword, message, instance location, and schema location:

```java
user.name = "";

ValidationResult errors = plan.validate(user);
for (ValidationResult.Detail error : errors.getErrors()) {
    System.out.println(error.getKeyword() + ": "
            + error.getInstancePs().rootedPointerExpr()
            + " — " + error.getMessage());
}
```

Use `ValidationOptions` when you need fail-fast control, strict `format` assertions, or JSON Schema annotations:

```java
ValidationOptions options = ValidationOptions.builder()
        .collectAnnotations(true)
        .build();

ValidationResult result = plan.validate(user, options);
result.getAnnotations(); // title, description, default, examples, etc.
```

Annotation collection is optional. By default, `SchemaPlan` treats `format` as an annotation rather than an assertion; enable `strictFormat` to check supported formats.

## Compiled Validation

`@CompiledValidator` generates Java validation code during annotation processing. It uses the same schema and Java model:

```java
@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}

UserValidator validator = CompiledInstances.create(UserValidator.class);
boolean valid = validator.isValid(user);
```

The generated implementation is `UserValidator_Impl`. Reuse the validator instance for repeated calls; generated checks avoid general-purpose schema evaluation when direct compilation is supported.

### Compilation and fallback

By default, `@CompiledValidator(fallback = false)` rejects unsupported schema constructs **at compile time**. To allow unsupported checks to use the Runtime `SchemaPlan`, opt in:

```java
@CompiledValidator(fallback = true)
interface UserDiagnostics {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    ValidationResult validate(User user);
}
```

Compiled methods accept one value and an optional `boolean strictFormat` parameter. Their return types determine the behavior:

| Return type | Behavior |
| --- | --- |
| `boolean` | Fail-fast result |
| `void` | Throw on validation failure |
| `ValidationResult` | Detailed results through Runtime fallback; requires `fallback = true` |

Common type, object, array, string, numeric, and composition constraints can compile directly. Some combinations, including complex `unevaluated*` tracking across schemas, require fallback.

See the [CompiledValidator reference](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/compiled-validator.md) for keyword coverage, limitations, and generated-code behavior.

## Schema References

SJF4J supports `$ref`, `$defs`, anchors, and referenced schemas. Register external documents with a `SchemaRegistry` before creating a Runtime plan:

```java
SchemaRegistry registry = new SchemaRegistry();
registry.index(
        URI.create("https://example.org/common"),
        JsonSchema.fromJson("{\"type\":\"string\"}")
);

SchemaPlan plan = JsonSchema.fromJson(
        "{\"$ref\":\"https://example.org/common\"}"
).createPlan(registry);
```

For annotation-based or Compiled validation, `@ValidJsonSchema` also supports `externalSchemas` (inline mappings) and `externalSchemasRef` (a JSON mapping file). Within a `@CompiledValidator` interface, for example:

```java
@ValidJsonSchema(
        ref = "classpath:/schemas/user.json",
        externalSchemasRef = "classpath:/schemas/external.json")
boolean isValid(User user);
```

The mapping file associates **absolute retrieval URIs** with JSON Schema documents. It lets you resolve external references locally; SJF4J does not automatically fetch remote schemas over HTTP.

For larger schema sets, `@CompiledValidator` also offers `registryDir` and `registryBaseUri`. When schema files change, make sure annotation processing runs again; incremental Java compilation does not always track external resources.

## Annotation-Based Validation

`@ValidJsonSchema` can also attach a schema to a Java type for **Runtime** validation, without a Compiled interface:

```java
@ValidJsonSchema(ref = "classpath:/schemas/user.json")
class User {
    public String name;
    public int age;
}

SchemaValidator validator = new SchemaValidator();
validator.requireValid(user);
```

`SchemaValidator` resolves type annotations (including annotated superclasses), caches their plans, and uses strict `format` checking by default. It is distinct from `SchemaPlan`, where you supply the schema explicitly.

For Compiled validators, `@ValidJsonSchema` may instead appear on a method or parameter; method annotations take precedence over parameter and type annotations.

## Compliance and Performance

SJF4J supports the JSON Schema **Draft 2020-12, 2019-09, and 7** dialects. Compatibility is exercised against the [official JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite). Independent compliance and comparison resources include [Bowtie](https://bowtie.report/) and [Creek Service](https://www.creekservice.org/json-schema-validation-comparison/).

Runtime validation operates directly on Java objects; Compiled validation can specialize repeated checks for stable schemas. Performance depends on the schema and input representation. See [JSON Schema Validation benchmarks](/docs/benchmarks#json-schema-validation) and the [full benchmark report](https://github.com/sjf4j-projects/sjf4j/blob/main/docs/performance/schema.md).
