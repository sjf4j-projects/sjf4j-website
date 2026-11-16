<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import HomeCodePanel from './HomeCodePanel.vue'

interface Example {
  title: string
  context: string
  code: string
}

interface Capability {
  id: string
  name: string
  path: string
  headline: string
  description: string
  examples: Example[]
  more: string[]
}

const capabilities: Capability[] = [
  {
    "id": "binding",
    "name": "Binding",
    "path": "/docs/binding",
    "headline": "From JSON to Java — and back",
    "description": "Bind structured input to ordinary Java classes, then write it to JSON or YAML. Use flexible runtime binding, or generate dedicated parsers and writers at compile time.",
    "examples": [
      {
        "title": "Runtime API",
        "context": "Read typed objects, modify them normally, and serialize to another format.",
        "code": String.raw`Sjf4j sjf4j = new Sjf4j();

// User is an ordinary POJO
User user = sjf4j.fromJson(json, User.class);
user.address.city = "Chongqing";

String updatedJson = sjf4j.toJsonString(user);
String yaml = sjf4j.toYamlString(user);

// Generic collections are supported
List<User> users = sjf4j.fromJson(
    jsonArray, new TypeReference<List<User>>() {});`
      },
      {
        "title": "Compiled API",
        "context": "Declare type-safe read/write operations; SJF4J generates the implementation.",
        "code": String.raw`@CompiledBinder
interface UserBinder {
    @Read User read(String json);
    @Write String write(User user);
}

UserBinder binder =
    CompiledInstances.create(UserBinder.class);

User user = binder.read(json);
String output = binder.write(user);`
      }
    ],
    "more": [
      "JSON, YAML, and Java Properties with pluggable backends",
      "@OneOf polymorphism, ValueCodec, and ExternalNode support"
    ]
  },
  {
    "id": "navigating",
    "name": "Navigating",
    "path": "/docs/navigating",
    "headline": "JSONPath for real Java objects",
    "description": "Read and mutate nested properties without converting your POJOs, Maps, or Lists into JSON trees. Compile frequently used paths into generated Java accessors.",
    "examples": [
      {
        "title": "Runtime API",
        "context": "Read and update a nested POJO property using one reusable path.",
        "code": String.raw`JsonPath cityPath =
    JsonPath.parse("$.address.city");

String oldCity = cityPath.getString(user);

// Modifies user.address.city in place
cityPath.put(user, "Chongqing");

String newCity = cityPath.getString(user);`
      },
      {
        "title": "Compiled API",
        "context": "Generate direct typed access to the same path.",
        "code": String.raw`@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);

    @PutByPath("$.address.city")
    String setCity(User user, String city);
}

UserNavigator nav =
    CompiledInstances.create(UserNavigator.class);
nav.setCity(user, "Chongqing");
String city = nav.getCity(user);`
      }
    ],
    "more": [
      "JSONPath (RFC 9535) and JSON Pointer (RFC 6901)",
      "Typed navigation and mutation with compile-time paths"
    ]
  },
  {
    "id": "validating",
    "name": "Validating",
    "path": "/docs/validating",
    "headline": "Validate POJOs with JSON Schema",
    "description": "Check Java objects directly against JSON Schema rules. Reuse a runtime validation plan or generate an implementation for a known schema.",
    "examples": [
      {
        "title": "Runtime API",
        "context": "Compile a schema into a reusable plan, then validate the object.",
        "code": String.raw`// Schema document supplied as a String
String rules = "{\"type\":\"object\","
    + "\"properties\":{\"age\":{"
    + "\"type\":\"integer\",\"minimum\":0}},"
    + "\"required\":[\"age\"]}";

JsonSchema schema = JsonSchema.fromJson(rules);
SchemaPlan plan = schema.createPlan();

ValidationResult result = plan.validate(user);`
      },
      {
        "title": "Compiled API",
        "context": "Refer to a schema file during annotation processing.",
        "code": String.raw`// src/main/resources/schemas/user.json
@CompiledValidator
interface UserValidator {
    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);

    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    void requireValid(User user);
}

UserValidator validator =
    CompiledInstances.create(UserValidator.class);
validator.requireValid(user);`
      }
    ],
    "more": [
      "Runtime support for JSON Schema Draft 2020-12, 2019-09, and 7",
      "Compiled validation for Draft 2020-12"
    ]
  },
  {
    "id": "object-mapping",
    "name": "Object Mapping",
    "path": "/docs/mapping",
    "headline": "Turn one object model into another",
    "description": "Convert matching structures at runtime or specify how generated mappers should rename and transform properties between Java types.",
    "examples": [
      {
        "title": "Runtime API",
        "context": "Convert maps and POJOs with compatible field names.",
        "code": String.raw`Map<String, Object> data = new HashMap<>();
data.put("name", "Alice");
data.put("age", 18);

Sjf4j sjf4j = new Sjf4j();
User user = sjf4j.convert(data, User.class);

// UserSummary has matching property names
UserSummary summary =
    sjf4j.convert(user, UserSummary.class);`
      },
      {
        "title": "Compiled API",
        "context": "Rename a field while the other matching fields map automatically.",
        "code": String.raw`class UserDto {
    public String fullName;
    public int age;
}

@CompiledMapper
interface UserMapper {
    @Mapping(target = "fullName", source = "name")
    UserDto toDto(User user);
}

UserMapper mapper =
    CompiledInstances.create(UserMapper.class);
UserDto dto = mapper.toDto(user);`
      }
    ],
    "more": [
      "Nested models, collections, map keys and values, and enums",
      "Custom converters and object creation rules"
    ]
  },
  {
    "id": "jdbc-result-mapping",
    "name": "JDBC Result Mapping",
    "path": "/docs/jdbc-mapping",
    "headline": "Straight from ResultSet to POJO",
    "description": "Generate direct JDBC mapping code. Consume a whole ResultSet at once, or prepare column positions once for reusable single-row mapping.",
    "examples": [
      {
        "title": "Compiled List Mapping",
        "context": "Convert every row into a Java object without hand-written column extraction.",
        "code": String.raw`@CompiledJdbcMapper
interface UserRows {
    List<User> readAll(ResultSet rs);
}

UserRows mapper =
    CompiledInstances.create(UserRows.class);

// ResultSet is initially before the first row
List<User> users = mapper.readAll(rs);`
      },
      {
        "title": "Compiled Row Mapping",
        "context": "Prepare the column layout once, then map already-positioned rows.",
        "code": String.raw`@CompiledJdbcMapper
interface UserRows {
    JdbcRowMapper<User> prepare(ResultSetMetaData meta);
}

UserRows mapper =
    CompiledInstances.create(UserRows.class);
JdbcRowMapper<User> rowMapper =
    mapper.prepare(rs.getMetaData());

List<User> users = new ArrayList<>();
while (rs.next()) {
    users.add(rowMapper.map(rs));
}`
      }
    ],
    "more": [
      "Case-insensitive snake_case column naming by default",
      "Explicit aliases and configurable column projection"
    ]
  },
  {
    "id": "patching",
    "name": "Patching",
    "path": "/docs/patching",
    "headline": "Describe changes, then apply them",
    "description": "Update object graphs through JSON Patch operations or merge partial objects with RFC 7386 semantics. No need for a separate JSON tree representation.",
    "examples": [
      {
        "title": "JSON Patch · RFC 6902",
        "context": "Apply a precise replace operation to a POJO; the returned root may change.",
        "code": String.raw`JsonPatch patch = JsonPatch.fromJson(
    "[{\"op\":\"replace\",\"path\":\"/name\","
    + "\"value\":\"Alice Zhang\"}]");

User updated = (User) patch.apply(user);

`
      },
      {
        "title": "JSON Merge Patch · RFC 7386",
        "context": "Update a mutable Map; a null patch member removes its key.",
        "code": String.raw`Map<String, Object> settings = new HashMap<>();
settings.put("theme", "light");
settings.put("legacy", true);

Map<String, Object> changes = new HashMap<>();
changes.put("theme", "dark");
changes.put("legacy", null);

Patches.mergePatch(settings, changes);
// settings now contains theme=dark`
      }
    ],
    "more": [
      "Generate a patch with JsonPatch.diff()",
      "Indexed deep merge for object and array updates"
    ]
  },
  {
    "id": "modeling",
    "name": "Modeling",
    "path": "/docs/modeling",
    "headline": "One structural model for Java and JSON",
    "description": "The Object-Based Node Tree (OBNT) treats POJOs, Maps, Lists, and JSON model types as object, array, or value nodes with common operations.",
    "examples": [
      {
        "title": "Access and traverse",
        "context": "Use the same structural helpers on POJOs and map-like structures.",
        "code": String.raw`String name = Nodes.toString(
    Nodes.getInObject(user, "name"));

Nodes.forEachObject(user, (key, value) ->
    System.out.println(key + " = " + value));

// Modifies the existing Java object
Nodes.putInObject(user, "name", "Alice Zhang");`
      },
      {
        "title": "Compare and inspect",
        "context": "Compare JSON-shaped structures, even when their Java types differ.",
        "code": String.raw`Map<String, Object> userMap =
    Nodes.toMap(user);

boolean same = Nodes.equals(user, userMap);

String debug = Nodes.inspect(user);
System.out.println(debug);`
      }
    ],
    "more": [
      "JOJO and JAJO extend standard object and array models",
      "@NodeValue, @OneOf, and ExternalNode add custom node types"
    ]
  }
]

const activeId = ref(capabilities[0].id)
const container = ref<HTMLElement | null>(null)
const activeCapability = computed(() => capabilities.find((item) => item.id === activeId.value) ?? capabilities[0])

function syncFromHash() {
  const id = window.location.hash.slice(1)
  const match = capabilities.find((item) => item.id === id)
  activeId.value = match?.id ?? capabilities[0].id

  if (match) {
    // The requested tab might not exist in the server-rendered initial HTML.
    void nextTick(() => {
      container.value?.scrollIntoView({ block: 'start' })
      document.getElementById(`home-feature-tab-${match.id}`)?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      })
    })
  }
}

function selectTab(id: string) {
  if (activeId.value === id) return
  activeId.value = id
  window.history.pushState(window.history.state, '', `#${id}`)
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  let nextIndex: number

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = (index + 1) % capabilities.length
      break
    case 'ArrowLeft':
      nextIndex = (index - 1 + capabilities.length) % capabilities.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = capabilities.length - 1
      break
    default:
      return
  }

  event.preventDefault()
  const item = capabilities[nextIndex]
  selectTab(item.id)
  document.getElementById(`home-feature-tab-${item.id}`)?.focus()
}

onMounted(() => {
  syncFromHash()
  window.addEventListener('hashchange', syncFromHash)
  window.addEventListener('popstate', syncFromHash)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncFromHash)
  window.removeEventListener('popstate', syncFromHash)
})
</script>

<template>
  <div ref="container" class="home-capabilities">
    <div class="feature-tabs" role="tablist" aria-label="SJF4J capabilities">
      <button
        v-for="(item, index) in capabilities"
        :id="'home-feature-tab-' + item.id"
        :key="item.id"
        type="button"
        role="tab"
        aria-controls="home-feature-panel"
        :aria-selected="activeId === item.id"
        :tabindex="activeId === item.id ? 0 : -1"
        @click="selectTab(item.id)"
        @keydown="onTabKeydown($event, index)"
      >{{ item.name }}</button>
    </div>

    <section
      id="home-feature-panel"
      class="capability"
      role="tabpanel"
      :aria-labelledby="'home-feature-tab-' + activeCapability.id"
      tabindex="0"
    >
      <div class="capability-heading">
        <h3 :id="activeCapability.id">{{ activeCapability.headline }}</h3>
        <p>{{ activeCapability.description }}</p>
      </div>

      <div class="capability-examples">
        <article v-for="example in activeCapability.examples" :key="example.title" class="capability-example">
          <p class="example-intro">{{ example.context }}</p>
          <HomeCodePanel :title="example.title" :code="example.code" />
        </article>
      </div>

      <div v-if="activeCapability.id === 'modeling'" class="modeling-overview">
        <strong>Object-Based Node Tree (OBNT)</strong>
        <table class="modeling-node-table">
          <thead><tr><th>Node kind</th><th>Java representations</th></tr></thead>
          <tbody>
            <tr><td>Object</td><td>Map, POJO, JsonObject, JOJO</td></tr>
            <tr><td>Array</td><td>List, Java arrays, JsonArray, JAJO</td></tr>
            <tr><td>Value</td><td>Strings, numbers, booleans, custom values</td></tr>
          </tbody>
        </table>
      </div>

      <div class="capability-more">
        <strong>Also supported</strong>
        <ul><li v-for="point in activeCapability.more" :key="point">{{ point }}</li></ul>
      </div>

      <a class="home-learn-more capability-learn-more" :href="activeCapability.path"
         :aria-label="'Learn more about ' + activeCapability.name">
        Learn more <span aria-hidden="true">→</span> {{ activeCapability.name }}
      </a>
    </section>
  </div>
</template>

<style scoped>
.home-capabilities {
  margin-top: 18px;
  scroll-margin-top: 90px;
}

/* Browser-style tabs share the content panel's top edge. */
.feature-tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  max-width: 100%;
  margin: 0;
  padding: 0 12px;
  border-bottom: 0;
  /* Divider is a background line so the selected tab can cover its segment. */
  background: linear-gradient(
    to bottom,
    transparent calc(100% - 1px),
    var(--vp-c-divider) calc(100% - 1px)
  );
  scrollbar-width: thin;
}

.feature-tabs button {
  position: relative;
  flex: 0 0 auto;
  margin: 0;
  padding: 11px 15px 12px;
  border: 1px solid transparent;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font-family: inherit;
  font-size: 15px;
  font-weight: 550;
  line-height: 1.5;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.feature-tabs button:hover:not([aria-selected="true"]) {
  color: var(--vp-c-text-1);
  background: linear-gradient(
    to bottom,
    var(--vp-c-bg-soft) calc(100% - 1px),
    transparent calc(100% - 1px)
  );
}

.feature-tabs button[aria-selected="true"] {
  z-index: 1;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
  border-bottom-color: var(--vp-c-bg);
  font-weight: 700;
}

.feature-tabs button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -3px;
}

.capability {
  box-sizing: border-box;
  padding: 26px 26px 30px;
  border: 1px solid var(--vp-c-divider);
  border-top: 0;
  border-radius: 0 0 10px 10px;
}

.capability-heading h3 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 23px;
  font-weight: 700;
  line-height: 1.4;
  scroll-margin-top: 90px;
}

.capability-heading p {
  max-width: 1000px;
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.65;
}

.capability-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
  margin-top: 24px;
}

.capability-example {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.example-intro {
  min-height: 50px;
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.55;
}

.capability-example :deep(.home-code-panel) {
  flex: 1;
}

.capability-more {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.capability-more strong {
  color: var(--vp-c-text-1);
  font-weight: 650;
}

.capability-more ul {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 32px;
  margin: 6px 0 0;
  padding-left: 19px;
}

.capability-more li {
  margin: 0;
}

.modeling-overview {
  margin-top: 24px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.modeling-overview strong {
  color: var(--vp-c-text-1);
}

.modeling-node-table {
  display: table;
  width: 100%;
  margin: 10px 0 0;
  border-collapse: collapse;
  font-size: 14px;
}

.modeling-node-table th,
.modeling-node-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

.modeling-node-table th {
  color: var(--vp-c-text-1);
}

.capability-learn-more {
  margin-top: 20px;
}

@media (max-width: 800px) {
  .capability {
    padding: 20px 16px 24px;
  }

  .capability-examples {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .example-intro {
    min-height: 0;
  }
}

@media (max-width: 480px) {
  .feature-tabs {
    padding: 0 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-tabs button {
    transition: none;
  }
}
</style>