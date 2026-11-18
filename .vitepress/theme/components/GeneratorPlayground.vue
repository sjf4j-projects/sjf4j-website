<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import { DEFAULT_OPTIONS, generateJava } from '../generator/index.ts'
import { createZip } from '../generator/zip.ts'
import type { GeneratorOptions } from '../generator/types.ts'

type Library = { id: number; text: string }
type PropertyRow = { pointer: string; label: string; type: string }

const example = JSON.stringify({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Order',
  description: 'An example checkout order.',
  type: 'object',
  required: ['id', 'amount'],
  properties: {
    id: { type: 'string', description: 'Order identifier.' },
    amount: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    customer: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        active: { type: 'boolean' },
      },
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          quantity: { type: 'integer' },
        },
      },
    },
    status: { type: 'string', enum: ['pending', 'in-progress', 'shipped'] },
  },
}, null, 2)

function defaultOptions(): GeneratorOptions {
  return { ...DEFAULT_OPTIONS, fieldTypes: {} }
}

const input = ref(example)
const options = ref<GeneratorOptions>(defaultOptions())
const libraries = ref<Library[]>([])
const nextLibraryId = ref(1)
const activePath = ref('')
const feedback = ref('')

const result = computed(() => generateJava(
  input.value,
  options.value,
  libraries.value.map((item) => item.text).filter((text) => text.trim().length > 0),
))
const errors = computed(() => result.value.diagnostics.filter((d) => d.severity === 'error'))
const warnings = computed(() => result.value.diagnostics.filter((d) => d.severity === 'warning'))
const files = computed(() => result.value.files)

watch(files, (next) => {
  if (!next.some((file) => file.path === activePath.value)) {
    activePath.value = next[0]?.path || ''
  }
}, { immediate: true })

const activeFile = computed(() => files.value.find((file) => file.path === activePath.value)
  || files.value[0])
const highlightedJava = computed(() => activeFile.value
  ? Prism.highlight(activeFile.value.content, Prism.languages.java, 'java') : '')

const propertyRows = computed<PropertyRow[]>(() => {
  let root: unknown
  try { root = JSON.parse(input.value) } catch { return [] }
  const rows: PropertyRow[] = []
  function walk(node: unknown, pointer: string, label: string, depth: number) {
    if (!node || typeof node !== 'object' || Array.isArray(node) || depth > 16) return
    const obj = node as Record<string, unknown>
    const props = obj.properties
    if (!props || typeof props !== 'object' || Array.isArray(props)) return
    for (const [key, value] of Object.entries(props)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const field = value as Record<string, unknown>
      const segment = key.replace(/~/g, '~0').replace(/\//g, '~1')
      const path = pointer + '/properties/' + segment
      const display = label ? label + '.' + key : key
      rows.push({
        pointer: path,
        label: display,
        type: typeof field.type === 'string' ? field.type : 'object / reference',
      })
      if (field.properties) walk(field, path, display, depth + 1)
      const items = field.items
      if (items && typeof items === 'object' && !Array.isArray(items)) {
        walk(items, path + '/items', display + '[*]', depth + 1)
      }
    }
  }
  walk(root, '#', '', 0)
  return rows
})

const javaTypes = [
  'String', 'Boolean', 'Integer', 'Long', 'Double', 'BigDecimal', 'BigInteger',
  'LocalDate', 'OffsetDateTime', 'LocalDateTime', 'Instant', 'UUID', 'URI',
  'JsonObject', 'Object',
]

function setOverride(pointer: string, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const changes = { ...options.value.fieldTypes }
  if (value) changes[pointer] = value
  else delete changes[pointer]
  options.value.fieldTypes = changes
}

function reset() {
  input.value = example
  options.value = defaultOptions()
  libraries.value = []
  feedback.value = ''
}

function formatInput() {
  try {
    input.value = JSON.stringify(JSON.parse(input.value), null, 2)
    feedback.value = ''
  } catch {
    feedback.value = 'Input is not valid JSON.'
  }
}

function addLibrary() {
  libraries.value.push({ id: nextLibraryId.value++, text: '' })
}

function removeLibrary(id: number) {
  libraries.value = libraries.value.filter((lib) => lib.id !== id)
}

async function copyFile() {
  if (!activeFile.value) return
  try {
    await navigator.clipboard.writeText(activeFile.value.content)
    feedback.value = 'Copied ' + activeFile.value.path.split('/').pop() + '.'
  } catch {
    feedback.value = 'Clipboard access was denied.'
  }
}

function downloadZip() {
  if (!files.value.length) return
  try {
    const contents = createZip(files.value)
    const blob = new Blob([contents], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sjf4j-generated-java.zip'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 3000)
    feedback.value = 'ZIP ready: ' + files.value.length + ' Java files.'
  } catch {
    feedback.value = 'Unable to build the ZIP file.'
  }
}
</script>

<template>
  <section class="generator-app">
    <header class="generator-heading">
      <div>
        <h1>Schema-to-Java Generator</h1>
        <p>Generate SJF4J-ready Java models from JSON Schema, entirely in your browser.</p>
      </div>
      <button class="generator-button generator-button-subtle" type="button" @click="reset">Reset</button>
    </header>

    <div class="generator-settings">
      <label>
        <span>Package</span>
        <input v-model.trim="options.packageName" type="text" spellcheck="false" placeholder="org.example.generated" />
      </label>
      <label>
        <span>Class name <small>(optional)</small></span>
        <input v-model.trim="options.className" type="text" spellcheck="false" placeholder="From schema title" />
      </label>
      <label>
        <span>Model</span>
        <select v-model="options.model">
          <option value="pojo">POJO — ordinary Java</option>
          <option value="jojo">JOJO — extends JsonObject</option>
        </select>
      </label>
    </div>

    <details class="generator-advanced">
      <summary>Advanced options</summary>
      <div class="generator-advanced-content">
        <div class="generator-advanced-grid">
          <label>
            <span>Members</span>
            <select v-model="options.accessors">
              <option value="fields">Public fields</option>
              <option value="methods">Private fields + getters/setters</option>
              <option value="lombok">Lombok getters/setters</option>
            </select>
          </label>
          <label>
            <span>Validation namespace</span>
            <select v-model="options.validationNamespace" :disabled="!options.validation">
              <option value="jakarta">jakarta.validation</option>
              <option value="javax">javax.validation</option>
            </select>
          </label>
          <label class="generator-check">
            <input v-model="options.validation" type="checkbox" />
            <span>Bean Validation annotations</span>
          </label>
          <label class="generator-check">
            <input v-model="options.javaDoc" type="checkbox" />
            <span>JavaDoc descriptions</span>
          </label>
        </div>
        <p class="generator-explanation">
          Generated sources target Java 8+. Lombok and validation annotations require their corresponding dependencies.
        </p>

        <details class="generator-nested">
          <summary>Schema Libraries <span>({{ libraries.length }})</span></summary>
          <p>Add explicitly supplied JSON Schema documents with a unique <code>$id</code> to resolve external references. No network requests are made.</p>
          <div v-for="library in libraries" :key="library.id" class="generator-library">
            <div class="generator-library-heading">
              <strong>Schema {{ library.id }}</strong>
              <button type="button" class="generator-text-button" @click="removeLibrary(library.id)">Remove</button>
            </div>
            <textarea v-model="library.text" rows="7" spellcheck="false" aria-label="Additional JSON Schema"></textarea>
          </div>
          <button type="button" class="generator-button generator-button-subtle" @click="addLibrary">Add schema</button>
        </details>

        <details v-if="propertyRows.length" class="generator-nested">
          <summary>Property type overrides <span>({{ propertyRows.length }} inline properties)</span></summary>
          <p>Override Java types only when needed. Other fields use the automatic schema mapping. Nested and referenced models are still generated separately.</p>
          <div class="generator-override-list">
            <div v-for="field in propertyRows" :key="field.pointer" class="generator-override-row">
              <div class="generator-override-path">
                <code>{{ field.label }}</code>
                <span>{{ field.type }}</span>
              </div>
              <select :value="options.fieldTypes[field.pointer] || ''" :aria-label="'Override type of ' + field.label" @change="setOverride(field.pointer, $event)">
                <option value="">Automatic</option>
                <option v-for="type in javaTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
          </div>
        </details>
      </div>
    </details>

    <div class="generator-workspace">
      <section class="generator-panel generator-schema-panel">
        <div class="generator-panel-heading">
          <strong>JSON Schema</strong>
          <button class="generator-text-button" type="button" @click="formatInput">Format</button>
        </div>
        <textarea v-model="input" aria-label="JSON Schema input" spellcheck="false" autocapitalize="off"></textarea>
        <div class="generator-panel-footer">{{ input.split('\n').length }} lines · {{ input.length }} characters</div>
      </section>

      <section class="generator-panel generator-result-panel">
        <div class="generator-panel-heading">
          <strong>Java Source</strong>
          <span v-if="files.length" class="generator-panel-heading-actions">
            <select v-model="activePath" aria-label="Select generated Java file">
              <option v-for="file in files" :key="file.path" :value="file.path">{{ file.path.split('/').pop() }}</option>
            </select>
            <button class="generator-text-button" type="button" @click="copyFile">Copy</button>
          </span>
        </div>
        <pre v-if="activeFile" class="generator-code"><code v-html="highlightedJava"></code></pre>
        <div v-else class="generator-empty">
          <strong>No Java source generated.</strong>
          <p>Fix the errors below to generate Java files.</p>
        </div>
        <div class="generator-panel-footer">
          <span>{{ files.length }} Java {{ files.length === 1 ? 'file' : 'files' }}</span>
          <button class="generator-button generator-button-primary" type="button" :disabled="!files.length" @click="downloadZip">Download ZIP</button>
        </div>
      </section>
    </div>

    <p v-if="feedback" class="generator-feedback" role="status">{{ feedback }}</p>
    <div v-if="errors.length || warnings.length" class="generator-diagnostics">
      <div v-for="(item, index) in errors" :key="'error-' + index" class="generator-diagnostic generator-error" role="alert">
        <strong>Error</strong> <code>{{ item.path }}</code> — {{ item.message }}
      </div>
      <div v-for="(item, index) in warnings" :key="'warning-' + index" class="generator-diagnostic generator-warning">
        <strong>Note</strong> <code>{{ item.path }}</code> — {{ item.message }}
      </div>
    </div>

    <div class="generator-information">
      <strong>Supported</strong>
      <span>Objects, arrays, scalar types, string enums, local and supplied external <code>$ref</code>, and compatible object <code>allOf</code>.</span>
      <strong>Limitations</strong>
      <span>Java classes describe the data model; they do not enforce full JSON Schema validation. <code>oneOf</code>, <code>anyOf</code>, and dynamic references are not modeled.</span>
      <strong>Documentation</strong>
      <span><a href="/docs/modeling">Modeling (OBNT)</a> · <a href="/docs/validating">Validating</a> · <a href="/docs/installation">Installation</a></span>
    </div>
  </section>
</template>
