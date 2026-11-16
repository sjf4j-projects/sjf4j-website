<script setup lang="ts">
import HomeCodePanel from './HomeCodePanel.vue'

interface Capability {
  name: string
  path: string
  description: string
  runtime?: string
  compiled?: string
  runtimeNote?: string
  compiledNote?: string
}

const capabilities: Capability[] = [
  {
    name: 'Binding',
    path: '/docs/binding',
    description: 'Read and write Java objects with the same API across JSON backends and data formats.',
    runtime: `Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.fromJson(json, User.class);
String output = sjf4j.toJsonString(user);`,
    compiled: `@CompiledBinder
interface UserBinder {
    @Read User read(String json);
    @Write String write(User user);
}`
  },
  {
    name: 'Navigating',
    path: '/docs/navigating',
    description: 'Query and update native Java object graphs using JSONPath or JSON Pointer.',
    runtime: `JsonPath path = JsonPath.parse("$.address.city");
String city = path.getString(user);
path.put(user, "Shanghai");`,
    compiled: `@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}`
  },
  {
    name: 'Validating',
    path: '/docs/validating',
    description: 'Validate Java objects against JSON Schema without serializing them first.',
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
    name: 'Object Mapping',
    path: '/docs/mapping',
    description: 'Convert between Java models, transform fields and map nested structures.',
    runtime: `AnotherUser dto =
        sjf4j.convert(user, AnotherUser.class);`,
    compiled: `@CompiledMapper
interface UserMapper {
    @Mapping(target = "fullName", source = "name")
    AnotherUser toAnother(User user);
}`
  },
  {
    name: 'JDBC Result Mapping',
    path: '/docs/jdbc-mapping',
    description: 'Generate direct, type-aware mappings from JDBC ResultSet to Java objects.',
    runtimeNote: 'JDBC Result Mapping is provided as a compile-time API.',
    compiled: `@CompiledJdbcMapper
interface UserJdbcMapper {
    List<User> users(ResultSet resultSet);
}`
  },
  {
    name: 'Modeling (OBNT)',
    path: '/docs/modeling',
    description: 'A shared structural model for POJOs, Maps, Lists and extensible JSON-like types.',
    runtime: `Object raw = Nodes.getInObject(user, "name");
String name = Nodes.toString(raw);`,
    compiledNote: 'The same object-based node model underpins the compiled APIs.'
  },
  {
    name: 'Patching',
    path: '/docs/patching',
    description: 'Apply JSON Patch, Merge Patch and indexed merge operations directly to Java objects.',
    runtime: `JsonPatch patch = JsonPatch.fromJson(patchJson);
patch.apply(user);`,
    compiledNote: 'JSON Patch is available through the runtime structural API.'
  }
]
</script>

<template>
  <div class="home-capabilities">
    <section v-for="item in capabilities" :key="item.name" class="capability">
      <div class="capability-heading">
        <div>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
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
  border-bottom: 1px solid var(--vp-c-divider);
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
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
}

.capability-heading p {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.55;
}

.capability-learn-more {
  display: inline-block;
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
