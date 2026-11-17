<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import HomeCodePanel from './HomeCodePanel.vue'

type DescriptionPart = string | { text: string; href: string }

interface Capability {
  id: string
  name: string
  path: string
  description: DescriptionPart[]
  runtime?: string
  compiled?: string
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
      ', supporting POJOs, Maps, Lists, generic types, and custom value types.'
    ],
    runtime: `public class User {
    public String name;
    public int age;
    public Address address;
}
public class Address {
    public String city;
}
Sjf4j sjf4j = Sjf4j().builer().build();

User user = sjf4j.fromJson(json, User.class);
String json2 = sjf4j.toJsonString(user);`,
    compiled: `@CompiledBinder
interface UserBinder {
    @Read User fromJson(String json);
    @Read String toJson(User user);
}
UserBinder binder = CompiledInstances.create(UserBinder.class);



User user = binder.fromJson(json);
String json2 = binder.toJson(user);`
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

// Read a property
String city = path.getString(user); 

// Update a property
path.put(user, "Chongqing");

// Find to a List
List<String> names = 
        JsonPath.parse("$..friends[?@.scores.math >= 90].name")
        .find(student, String.class);`,
    compiled: `@CompiledNavigator
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
    name: 'Validating',
    path: '/docs/validating',
    description: [
      'Validate Java objects directly against ',
      { text: 'JSON Schema', href: 'https://json-schema.org/' },
      ' (drafts 2020-12, 2019-09, and 7), without constructing intermediate JSON trees.'
    ],
    runtime: `JsonSchema schema = JsonSchema.fromJson("""
{
  "type": "object",
  "properties": {
    "name": {"type": "string", "minLength": 1},
    "age": {"type": "integer", "minimum": 0}
  },
  "required": ["name"]
}
""");
SchemaPlan plan = schema.createPlan();

boolean valid = plan.isValid(user);`,
    compiled: `@CompiledValidator
interface UserValidator {
    UserValidator INSTANCE = ...;

    @ValidJsonSchema(ref = "classpath:/schemas/user.json")
    boolean isValid(User user);
}


boolean valid = UserValidator.INSTANCE.isValid(user);`
  },
  {
    id: 'object-mapping',
    name: 'Object Mapping',
    path: '/docs/mapping',
    description: [
      'Convert between Maps, POJOs, values, and nested Java structures.'
    ],
    runtime: `public class AnotherUser {
    public String fullName;
    public int age;
}

AnotherUser dto = sjf4j.convert(user, AnotherUser.class);`,
    compiled: `@CompiledMapper
interface UserMapper {
    UserMapper INSTANCE = ...;

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
    compiled: `@CompiledJdbcMapper
interface UserJdbcMapper {
    JdbcRowMapper<User> prepare(ResultSetMetaData metadata);
    List<User> users(ResultSet rs);
}

// Map a single row to a User
JdbcRowMapper<User> rowMapper = mapper.prepare(rs.getMetaData());
User user = rowMapper.map(rs);

// Map all rows to a List
List<User> users = mapper.users(rs);`
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
    runtime: `JsonPatch patch = JsonPatch.fromJson("""
        [{"op": "replace", "path": "/name", "value": "Alice Zhang"}]
        """);

patch.apply(user);  // Update in place`,
  },
  {
    id: 'modeling',
    name: 'Modeling',
    path: '/docs/modeling',
    description: [
      'Access, traverse, and compare Java objects through a consistent API that follows JSON semantics.'
    ],
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
        :id="`home-feature-tab-${item.id}`"
        :key="item.id"
        type="button"
        role="tab"
        aria-controls="home-feature-panel"
        :aria-selected="activeId === item.id"
        :tabindex="activeId === item.id ? 0 : -1"
        @click="selectTab(item.id)"
        @keydown="onTabKeydown($event, index)"
      >
        {{ item.name }}
      </button>
    </div>

    <section
      id="home-feature-panel"
      class="capability"
      role="tabpanel"
      :aria-labelledby="`home-feature-tab-${activeCapability.id}`"
      tabindex="0"
    >
      <div class="capability-heading">
        <h3 :id="activeCapability.id">{{ activeCapability.name }}</h3>
        <p>
          <template v-for="(part, index) in activeCapability.description" :key="index">
            <template v-if="typeof part === 'string'">{{ part }}</template>
            <a v-else :href="part.href" target="_blank" rel="noopener noreferrer">{{ part.text }}</a>
          </template>
        </p>
      </div>

      <div class="capability-columns" :class="{ 'modeling-columns': activeCapability.id === 'modeling' }">
        <HomeCodePanel
          v-if="activeCapability.runtime"
          :key="`${activeCapability.id}-runtime`"
          title="Runtime"
          :code="activeCapability.runtime"
        />
        <HomeCodePanel
          v-if="activeCapability.compiled"
          :key="`${activeCapability.id}-compiled`"
          title="Compiled"
          :class="{ 'compiled-only': activeCapability.id === 'jdbc-result-mapping' }"
          :code="activeCapability.compiled"
        />
        <aside v-if="activeCapability.id === 'modeling'" class="modeling-info" aria-label="OBNT model overview">
          <p>
            <strong>OBNT (Object-Based Node Tree)</strong> is the unified structural model behind SJF4J's APIs.
            It defines three kinds of nodes:
          </p>
          <table class="modeling-node-table">
            <thead>
              <tr><th>Node kind</th><th>Java representations</th></tr>
            </thead>
            <tbody>
              <tr><td>Object</td><td><code>Map</code>, POJOs, <code>JsonObject</code>, JOJOs</td></tr>
              <tr><td>Array</td><td><code>List</code>, Java arrays, <code>JsonArray</code>, JAJOs</td></tr>
              <tr><td>Value</td><td>Strings, numbers, booleans, custom value types</td></tr>
            </tbody>
          </table>
          <p>OBNT also supports extensible object models:</p>
          <ul>
            <li><strong>JOJO</strong> extends <code>JsonObject</code> with typed properties and dynamic members.</li>
            <li><strong>JAJO</strong> extends <code>JsonArray</code> for typed, extensible arrays.</li>
            <li><code>@NodeValue</code> defines logical value nodes.</li>
            <li><code>@OneOf</code> models polymorphic node types.</li>
            <li><code>ExternalNode</code> integrates custom structural types.</li>
          </ul>
        </aside>
      </div>

      <p v-if="activeCapability.id === 'binding'" class="capability-detail">
        SJF4J's open streaming architecture supports custom data formats and backends.
        Its rich binding capabilities include <code>@OneOf</code> polymorphism,
        multi-format <code>ValueCodec</code> support, and fully managed
        <code>ExternalNode</code> integration.
      </p>
      <p v-else-if="activeCapability.id === 'object-mapping'" class="capability-detail">
        The Runtime API, <code>Sjf4j.convert()</code>, performs direct object conversion.<br/>
        <code>@CompiledMapper</code> supports custom mapping rules for property renaming,
        nested mappings, expressions, and object creation.
      </p>
      <p v-else-if="activeCapability.id === 'patching'" class="capability-detail">
        Patching is available through the Runtime API only; there is no Compiled API.
      </p>

      <a
        class="home-learn-more capability-learn-more"
        :href="activeCapability.path"
        :aria-label="`Learn more about ${activeCapability.name}`"
      >
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
  padding: 20px 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-top: 0;
  border-radius: 0 0 10px 10px;
}

.capability-heading h3 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  scroll-margin-top: 90px;
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

.capability-detail {
  margin: 18px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.55;
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

/* Keep the Compiled-only JDBC sample in the right column. */
.capability-columns .compiled-only {
  grid-column: 2;
}

.modeling-columns {
  align-items: start;
}

.modeling-info {
  min-width: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.5;
}

.modeling-info h4 {
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.4;
}

.modeling-info p {
  margin: 0 0 10px;
}

.modeling-info .modeling-node-table {
  display: table;
  width: 100%;
  margin: 6px 0 14px;
  font-size: 13px;
  line-height: 1.45;
  border-collapse: collapse;
}

.modeling-node-table th,
.modeling-node-table td {
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--vp-c-divider);
}

.modeling-node-table th {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.modeling-info ul {
  margin: 0;
  padding-left: 20px;
}

.modeling-info li {
  margin: 3px 0;
}

.modeling-info code {
  font-size: 0.92em;
}

@media (max-width: 800px) {
  .capability-columns {
    grid-template-columns: 1fr;
    gap: 11px;
  }

  .capability-columns .compiled-only {
    grid-column: 1;
  }
}

@media (max-width: 480px) {
  .feature-tabs {
    padding: 0 8px;
  }

  .capability {
    padding: 18px 14px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-tabs button {
    transition: none;
  }
}
</style>