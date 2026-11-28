import type { CapabilityId } from '../i18n/types'

// Shared code examples and English documentation destinations.
// Keep locale-specific titles/descriptions in i18n/{en,zh}.ts.
export interface Capability {
  id: CapabilityId
  path: string
  runtime?: string
  compiled?: string
}

export const capabilities: Capability[] = [
  {
    id: 'binding',
    path: '/docs/binding',
    runtime: `public class User {
    public String name;
    public int age;
    public Address address;
}
public class Address {
    public String city;
}
Sjf4j sjf4j = Sjf4j.builder().build();

User user = sjf4j.fromJson(json, User.class);
String json2 = sjf4j.toJsonString(user);`,
    compiled: `@CompiledBinder
interface UserBinder {
    @Read User fromJson(String json);
    @Write String toJson(User user);
}
UserBinder binder = CompiledInstances.create(UserBinder.class);

User user = binder.fromJson(json);
String json2 = binder.toJson(user);`
  },
  {
    id: 'navigating',
    path: '/docs/navigating',
    runtime: `JsonPath path = JsonPath.parse("$.address.city");

// Read a property
String city = path.getString(user); 

// Update a property
path.put(user, "Chongqing");

// Find to a List
List<String> names = 
        JsonPath.parse("$..friends[?@.scores.math >= 90].name")
        .find(student, String.class);`,
    compiled: `@CompiledNavigator(fallback = true)
interface UserNavigator {
    @GetByPath("/address/city")
    String getCity(User user);

    @PutByPath("$.address.city")
    String putCity(User user, String city);

    @FindByPath("$..friends[?@.scores.math >= 90].name")
    List<String> find(Student student);
}`
  },
  {
    id: 'validating',
    path: '/docs/validating',
    runtime: `// schemaJson contains a JSON Schema document
JsonSchema schema = JsonSchema.fromJson(schemaJson);
SchemaPlan plan = schema.formulate();

boolean valid = plan.isValid(user);`,
    compiled: `@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}

UserValidator validator = CompiledInstances.create(UserValidator.class);
boolean valid = validator.isValid(user);`
  },
  {
    id: 'object-mapping',
    path: '/docs/mapping',
    runtime: `public class AnotherUser {
    public String name;
    public String fullName;
    public int age;
}

// Runtime conversion maps matching properties
AnotherUser dto = sjf4j.convert(user, AnotherUser.class);`,
    compiled: `@CompiledMapper
interface UserMapper {
    @Mapping(target = "fullName", source = "name")
    AnotherUser toAnother(User user);
}

UserMapper mapper = CompiledInstances.create(UserMapper.class);
AnotherUser dto = mapper.toAnother(user);`
  },
  {
    id: 'jdbc-result-mapping',
    path: '/docs/jdbc-mapping',
    compiled: `@CompiledJdbcMapper
interface UserJdbcMapper {
    List<User> users(ResultSet rs);
    JdbcRowMapper<User> prepare(ResultSetMetaData metadata);
}

UserJdbcMapper mapper = CompiledInstances.create(UserJdbcMapper.class);

// Cursor-consuming mapping: before the first row
List<User> users = mapper.users(rs);

// Or map current rows on a separate ResultSet
JdbcRowMapper<User> rowMapper = mapper.prepare(otherRs.getMetaData());
while (otherRs.next()) {
    User user = rowMapper.map(otherRs);
}`
  },
  {
    id: 'patching',
    path: '/docs/patching',
    runtime: `JsonPatch patch = JsonPatch.fromJson(
        \"[{\\\"op\\\":\\\"replace\\\",\\\"path\\\":\\\"/name\\\",\\\"value\\\":\\\"Alice Zhang\\\"}]\");

patch.apply(user);  // Update in place`,
  },
  {
    id: 'modeling',
    path: '/docs/modeling',
    runtime: `// Access and convert property values
Object raw = Nodes.getInObject(user, "name");
String name = Nodes.toString(raw);

// Iterate over object properties
Nodes.forEachObject(user, (key, value) ->
        System.out.println(key + ": " + value));

// Compare objects by JSON semantics
if (!Nodes.equals(user, userMap)) {
    // Inspect object structure
    System.out.println("user: " + Nodes.inspect(user));
}`,
  }
]
