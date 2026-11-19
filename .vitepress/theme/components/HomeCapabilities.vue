<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import CodePanel from './CodePanel.vue'
import { capabilities } from '../data/capabilities'
import { useSiteMessages } from '../i18n'
import { useData } from 'vitepress'
import { localizedLink } from '../../i18n/routes'

const t = useSiteMessages()
const { lang } = useData()
const activeId = ref(capabilities[0].id)
const container = ref<HTMLElement | null>(null)
const activeCapability = computed(() => capabilities.find((item) => item.id === activeId.value) ?? capabilities[0])
const activeText = computed(() => t.value.home.capabilities.items[activeCapability.value.id])

function syncFromHash() {
  const id = window.location.hash.slice(1)
  const match = capabilities.find((item) => item.id === id)
  activeId.value = match?.id ?? capabilities[0].id

  if (match) {
    void nextTick(() => {
      container.value?.scrollIntoView({ block: 'start' })
      document.getElementById(`home-feature-tab-${match.id}`)?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      })
    })
  }
}

function selectTab(id: typeof activeId.value) {
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
    <div class="feature-tabs" role="tablist" :aria-label="t.home.capabilities.tabsLabel">
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
        {{ t.home.capabilities.items[item.id].name }}
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
        <h3 :id="activeCapability.id">{{ activeText.name }}</h3>
        <p>
          <template v-for="(part, index) in activeText.description" :key="index">
            <template v-if="typeof part === 'string'">{{ part }}</template>
            <a
              v-else-if="'href' in part"
              :href="part.href"
              target="_blank"
              rel="noopener noreferrer"
            >{{ part.text }}</a>
          </template>
        </p>
      </div>

      <div class="capability-columns" :class="{ 'modeling-columns': activeCapability.id === 'modeling' }">
        <CodePanel
          v-if="activeCapability.runtime"
          :key="`${activeCapability.id}-runtime`"
          :title="t.home.capabilities.runtime"
          :code="activeCapability.runtime"
        />
        <CodePanel
          v-if="activeCapability.compiled"
          :key="`${activeCapability.id}-compiled`"
          :title="t.home.capabilities.compiled"
          :code="activeCapability.compiled"
        />
        <aside v-if="activeCapability.id === 'modeling'" class="modeling-info" :aria-label="t.home.capabilities.modeling.label">
          <p>
            <strong>OBNT (Object-Based Node Tree)</strong> {{ t.home.capabilities.modeling.introduction }}
          </p>
          <table class="modeling-node-table">
            <thead>
              <tr>
                <th>{{ t.home.capabilities.modeling.nodeType }}</th>
                <th>{{ t.home.capabilities.modeling.javaRepresentation }}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{{ t.home.capabilities.modeling.objectNode }}</td><td><code>Map</code>, POJOs, <code>JsonObject</code>, JOJOs</td></tr>
              <tr><td>{{ t.home.capabilities.modeling.arrayNode }}</td><td><code>List</code>, Java arrays, <code>JsonArray</code>, JAJOs</td></tr>
              <tr><td>{{ t.home.capabilities.modeling.valueNode }}</td><td>{{ t.home.capabilities.modeling.valueTypes }}</td></tr>
            </tbody>
          </table>
          <p>{{ t.home.capabilities.modeling.extensions }}</p>
          <ul>
            <li><strong>JOJO</strong> {{ t.home.capabilities.modeling.jojo }}</li>
            <li><strong>JAJO</strong> {{ t.home.capabilities.modeling.jajo }}</li>
            <li><code>@NodeValue</code> {{ t.home.capabilities.modeling.nodeValue }}</li>
            <li><code>@OneOf</code> {{ t.home.capabilities.modeling.oneOf }}</li>
            <li><code>ExternalNode</code> {{ t.home.capabilities.modeling.externalNode }}</li>
          </ul>
        </aside>
      </div>

      <p v-if="activeText.detail" class="capability-detail">
        <template v-for="(part, index) in activeText.detail" :key="index">
          <template v-if="typeof part === 'string'">{{ part }}</template>
          <code v-else-if="'code' in part">{{ part.code }}</code>
          <br v-else-if="'break' in part"/>
          <a v-else-if="'href' in part" :href="part.href">{{ part.text }}</a>
        </template>
      </p>

      <a
        class="home-learn-more capability-learn-more"
        :href="localizedLink(activeCapability.path, lang)"
        :aria-label="t.home.capabilities.learnMoreLabel(activeText.name)"
      >
        {{ t.home.capabilities.learnMore(activeText.name) }}
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
  justify-content: safe center;
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