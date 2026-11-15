<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeCodePanel from './HomeCodePanel.vue'

// The placeholder is used only if both official Maven Central sources fail.
const version = ref('{version}')

function isRelease(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d+\.\d+\.\d+(?:[-.][a-zA-Z0-9.]+)?$/.test(value)
    && !value.toUpperCase().includes('SNAPSHOT')
}

async function readRepositoryMetadata(): Promise<string> {
  const response = await fetch('https://repo.maven.apache.org/maven2/org/sjf4j/sjf4j/maven-metadata.xml', {
    signal: AbortSignal.timeout(5000)
  })
  if (!response.ok) throw new Error(`Maven repository returned HTTP ${response.status}`)

  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml')
  if (xml.querySelector('parsererror')) throw new Error('Invalid Maven repository XML')

  const release = xml.querySelector('versioning > release')?.textContent?.trim()
  if (!isRelease(release)) throw new Error('Missing valid <release> in Maven metadata')
  return release
}

async function readSearchIndex(): Promise<string> {
  const query = encodeURIComponent('g:org.sjf4j AND a:sjf4j')
  const response = await fetch(`https://search.maven.org/solrsearch/select?q=${query}&rows=1&wt=json`, {
    signal: AbortSignal.timeout(5000)
  })
  if (!response.ok) throw new Error(`Maven search returned HTTP ${response.status}`)

  const data = await response.json()
  const item = data?.response?.docs?.find((doc: { g?: string; a?: string }) =>
    doc.g === 'org.sjf4j' && doc.a === 'sjf4j'
  )
  const release = item?.latestVersion
  if (!isRelease(release)) throw new Error('Missing valid latestVersion in Maven search result')
  return release
}

onMounted(async () => {
  const errors: unknown[] = []
  for (const resolve of [readRepositoryMetadata, readSearchIndex]) {
    try {
      version.value = await resolve()
      return
    } catch (error) {
      errors.push(error)
    }
  }
  // Keep {version} and leave useful diagnostics rather than silently swallowing failures.
  console.warn('SJF4J: Unable to load the latest org.sjf4j:sjf4j release from Maven Central.', ...errors)
})
const gradle = computed(() => `implementation("org.sjf4j:sjf4j:${version.value}")`)
const maven = computed(() => `<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j</artifactId>
    <version>${version.value}</version>
</dependency>`)
</script>

<template>
  <div class="installation-grid">
    <HomeCodePanel title="Gradle (Kotlin DSL)" language="Kotlin" :code="gradle" />
    <HomeCodePanel title="Maven" language="XML" :code="maven" />
  </div>
</template>

<style scoped>
.installation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  margin: 18px 0;
}

@media (max-width: 720px) {
  .installation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
