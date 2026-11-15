<script setup lang="ts">
import HomeCodePanel from './HomeCodePanel.vue'

const gradle = 'implementation("org.sjf4j:sjf4j:{version}")'
const maven = `<dependency>
    <groupId>org.sjf4j</groupId>
    <artifactId>sjf4j</artifactId>
    <version>{version}</version>
</dependency>`
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
