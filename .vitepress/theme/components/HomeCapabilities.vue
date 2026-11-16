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
  },
  {
    id: 'modeling',
    name: 'Modeling',
    path: '/docs/modeling',
    description: [
      'OBNT provides the shared structural model for SJF4J APIs, covering native POJOs, Maps, Lists, and extensible object types.'
    ],
    runtime: `Object raw = Nodes.getInObject(user, "name");
String name = Nodes.toString(raw);`,
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

      <div class="capability-columns">
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
          :code="activeCapability.compiled"
        />
      </div>

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
  border-bottom: 1px solid var(--vp-c-divider);
  background: transparent;
  scrollbar-width: thin;
}

.feature-tabs button {
  position: relative;
  flex: 0 0 auto;
  margin: 0 0 -1px;
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
  background: var(--vp-c-bg-soft);
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
  height: 470px;
  overflow-y: auto;
  scrollbar-gutter: stable;
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
  .capability {
    height: 780px;
  }

  .capability-columns {
    grid-template-columns: 1fr;
    gap: 11px;
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