<script setup lang="ts">
import HomeCodePanel from './HomeCodePanel.vue'

type DescriptionPart = string | { text: string; href: string }

interface Capability {
  id: string
  name: string
  path: string
  description: DescriptionPart[]
  runtime?: string
  compiled?: string
  runtimeNote?: string
  compiledNote?: string
}

const capabilities: Capability[] = [
  {
    id: 'binding',
    name: 'Binding',
    path: '/docs/binding',
    description: [
      'Unified data binding across ',
      { text: 'JSON', href: 'https://www.rfc-editor.org/info/rfc8259' },
      ', ',
      { text: 'YAML', href: 'https://yaml.org/spec/1.2.2/' },
      ', and ',
      { text: 'Java Properties', href: 'https://docs.oracle.com/javase/8/docs/api/java/util/Properties.html' },
      ', supporting POJOs, Maps, Lists, generic types, and custom values.'
    ],
    runtime: `Sjf4j sjf4j = new Sjf4j();

User user = sjf4j.fromJson(json, User.class);
String yaml = sjf4j.toYamlString(user);`,
    compiled: `@CompiledBinder
interface UserJsonBinder {
    @Read User read(String json);
}`
  },
  {
    id: 'navigating',
    name: 'Navigating',
    path: '/docs/navigating',
    description: [
      'Query and modify Java object graphs with ',
      { text: 'JSONPath (RFC 9535)', href: 'https://www.rfc-editor.org/info/rfc9535' },
      ' or ',
      { text: 'JSON Pointer (RFC 6901)', href: 'https://www.rfc-editor.org/info/rfc6901' },
      ', without intermediate JSON trees.'
    ],
    runtime: `JsonPath path = JsonPath.parse("$.address.city");

String city = path.getString(user); // Read a property
path.put(user, "Shanghai");        // Update a property`,
    compiled: `@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);

    @PutByPath("$.address.city")
    String putCity(User user, String city);
}`
  },
  {
    id: 'validating',
    name: 'Validating',
    path: '/docs/validating',
    description: [
      'Validate Java objects directly against ',
      { text: 'JSON Schema', href: 'https://json-schema.org/' },
      ' (Draft 2020-12, 2019-09, and 7), without constructing JSON trees.'
    ],
    runtime: `JsonSchema schema = JsonSchema.fromJson(schemaJson);
ValidationResult result =
        schema.createPlan().validate(user);`,
    compiled: `@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}`
  },
  {
    id: 'object-mapping',
    name: 'Object Mapping',
    path: '/docs/mapping',
    description: [
      'Convert between Maps, POJOs, values, and nested Java structures; compile-time mapping supports property renaming and custom transformations.'
    ],
    runtime: `AnotherUser dto =
        sjf4j.convert(user, AnotherUser.class);`,
    compiled: `@CompiledMapper
interface UserMapper {
    @Mapping(target = "fullName", source = "name")
    AnotherUser toAnother(User user);
}`
  },
  {
    id: 'jdbc-result-mapping',
    name: 'JDBC Result Mapping',
    path: '/docs/jdbc-mapping',
    description: [
      'Generate direct mappings from JDBC ResultSet rows to Java objects with @CompiledJdbcMapper.'
    ],
    runtimeNote: 'JDBC Result Mapping is provided as a compile-time API.',
    compiled: `@CompiledJdbcMapper
interface UserJdbcMapper {
    List<User> users(ResultSet resultSet);
}`
  },
  {
    id: 'patching',
    name: 'Patching',
    path: '/docs/patching',
    description: [
      'Apply ',
      { text: 'JSON Patch (RFC 6902)', href: 'https://www.rfc-editor.org/info/rfc6902' },
      ', ',
      { text: 'JSON Merge Patch (RFC 7386)', href: 'https://www.rfc-editor.org/info/rfc7386' },
      ', and indexed merge operations directly to Java object graphs.'
    ],
    runtime: `JsonPatch patch = JsonPatch.fromJson(patchJson);
patch.apply(user);`,
    compiledNote: 'JSON Patch is available through the runtime structural API.'
  },
  {
    id: 'modeling',
    name: 'Modeling (OBNT)',
    path: '/docs/modeling',
    description: [
      'OBNT provides the shared structural model for SJF4J APIs, covering native POJOs, Maps, Lists, and extensible object types.'
    ],
    runtime: `Object raw = Nodes.getInObject(user, "name");
String name = Nodes.toString(raw);`,
    compiledNote: 'The same object-based node model underpins the compiled APIs.'
  }
]
</script>

<template>
  <div class="home-capabilities">
    <section v-for="item in capabilities" :id="item.id" :key="item.id" class="capability">
      <div class="capability-heading">
        <div>
          <h3>{{ item.name }}</h3>
          <p>
            <template v-for="(part, index) in item.description" :key="index">
              <template v-if="typeof part === 'string'">{{ part }}</template>
              <a v-else :href="part.href" target="_blank" rel="noopener noreferrer">{{ part.text }}</a>
            </template>
          </p>
        </div>
      </div>
      <div class="capability-columns">
        <HomeCodePanel title="Runtime" :code="item.runtime" :note="item.runtimeNote" />
        <HomeCodePanel title="Compiled" :code="item.compiled" :note="item.compiledNote" />
      </div>
      <a class="home-learn-more capability-learn-more" :href="item.path" :aria-label="`Learn more about ${item.name}`">
        Learn more <span aria-hidden="true">→</span> {{ item.name }}
      </a>
    </section>
  </div>
</template>

<style scoped>
.home-capabilities {
  margin-top: 12px;
}

.capability {
  padding: 23px 0 26px;
  scroll-margin-top: 90px;
}

.capability:first-child {
  padding-top: 7px;
}

.capability-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
}

.capability-heading h3 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
}

.capability-heading p {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.55;
}

.capability-heading p a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-divider);
  text-underline-offset: 2px;
}

.capability-heading p a:hover {
  text-decoration-color: currentColor;
}

.capability-learn-more {
  margin-top: 14px;
}

.capability-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 56px;
  margin-top: 16px;
}

@media (max-width: 800px) {
  .capability-columns {
    grid-template-columns: 1fr;
    gap: 11px;
  }
}

@media (max-width: 540px) {
  .capability-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
}
</style>
