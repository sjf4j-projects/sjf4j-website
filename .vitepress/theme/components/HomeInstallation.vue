<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeCodePanel from './HomeCodePanel.vue'

// Fallback to the last verified release if Maven Central is temporarily unavailable.
// Query the exact all-in-one artifact used in the examples, not sjf4j-core.
const version = ref('1.3.3')

onMounted(async () => {
  try {
    const response = await fetch('https://repo.maven.apache.org/maven2/org/sjf4j/sjf4j/maven-metadata.xml')
    if (!response.ok) return

    const xml = new DOMParser().parseFromString(await response.text(), 'application/xml')
    if (xml.querySelector('parsererror')) return

    const release = xml.querySelector('versioning > release')?.textContent?.trim()
    if (release && /^\d+\.\d+\.\d+(?:[-.][a-zA-Z0-9.]+)?$/.test(release)) {
      version.value = release
    }
  } catch {
    // Keep the last verified release when metadata cannot be loaded.
  }
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
