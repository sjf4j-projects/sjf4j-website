<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeCodePanel from './HomeCodePanel.vue'

// Start with the last verified stable release so installation examples never show a placeholder.
// Refresh from Maven Central at runtime, with GitHub Releases as a CORS-friendly fallback.
const version = ref('1.5.1')

function isRelease(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d+\.\d+\.\d+$/.test(value)
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

async function readBadgeVersion(): Promise<string> {
  const response = await fetch('https://img.shields.io/maven-central/v/org.sjf4j/sjf4j.json', {
    signal: AbortSignal.timeout(5000)
  })
  if (!response.ok) throw new Error(`Maven badge returned HTTP ${response.status}`)

  const data = await response.json()
  const release = data?.message
  if (!isRelease(release)) throw new Error('Missing valid version in Maven badge')
  return release
}

async function readGitHubRelease(): Promise<string> {
  const response = await fetch('https://api.github.com/repos/sjf4j-projects/sjf4j/releases/latest', {
    signal: AbortSignal.timeout(5000)
  })
  if (!response.ok) throw new Error(`GitHub releases returned HTTP ${response.status}`)

  const data = await response.json()
  const release = data?.tag_name?.replace(/^v/, '')
  if (!isRelease(release)) throw new Error('Missing stable version in latest GitHub release')
  return release
}

onMounted(async () => {
  // Repositories and search indexes may be cached at different ages.
  // Resolve concurrently and prefer the highest valid stable Maven Central version.
  const results = await Promise.allSettled([
    readRepositoryMetadata(),
    readSearchIndex(),
    readBadgeVersion(),
    readGitHubRelease()
  ])
  const resolved = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
  const versions = [version.value, ...resolved]

  version.value = versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0]
  if (resolved.length) return

  // Preserve the last verified release if all live lookups are unavailable.
  console.warn(
    'SJF4J: Unable to refresh the latest release; using the last verified version.',
    ...results.filter(result => result.status === 'rejected').map(result => result.reason)
  )
})

const gradle = computed(() => `// Core structural processing API
implementation("org.sjf4j:sjf4j-core:${version.value}")

// Optional: Compile-time APIs
annotationProcessor("org.sjf4j:sjf4j-processor:${version.value}")

// Optional: JSON Schema validation
implementation("org.sjf4j:sjf4j-schema:${version.value}")

// Optional: Backend and its dependency (Jackson 2.x example) 
implementation("org.sjf4j:sjf4j-backend-jackson2:${version.value}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")`)
const maven = computed(() => `<dependencies>
    <!-- Core structural processing API -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-core</artifactId>
        <version>${version.value}</version>
    </dependency>

    <!-- Optional: JSON Schema validation -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-schema</artifactId>
        <version>${version.value}</version>
    </dependency>

    <!-- Optional: Backend and its dependency (Jackson 2.x example) -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jackson2</artifactId>
        <version>${version.value}</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.22.3</version>
    </dependency>
</dependencies>

<!-- Optional: Compile-time APIs -->
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.sjf4j</groupId>
                        <artifactId>sjf4j-processor</artifactId>
                        <version>${version.value}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>`)

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
  gap: 56px;
  margin: 18px 0;
}

/* Match the code viewport to the 12-line Gradle example; scroll longer Maven XML. */
.installation-grid :deep(.home-code-panel) {
  height: 332px;
}

.installation-grid :deep(.home-code-panel pre) {
  min-height: 0;
  overflow: auto;
}


@media (max-width: 720px) {
  .installation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
