<script setup lang="ts">
import HomeCodePanel from './HomeCodePanel.vue'

// Keep the installation examples consistent with the README.
const gradle = `// Core structural processing API
implementation("org.sjf4j:sjf4j-core:{version}")

// Optional: Compile-time APIs
annotationProcessor("org.sjf4j:sjf4j-processor:{version}")

// Optional: JSON Schema validation
implementation("org.sjf4j:sjf4j-schema:{version}")

// Optional: Backend and its dependency (Jackson 2.x example) 
implementation("org.sjf4j:sjf4j-backend-jackson2:{version}")
implementation("com.fasterxml.jackson.core:jackson-databind:2.22.3")`
const maven = `<dependencies>
    <!-- Core structural processing API -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-core</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: JSON Schema validation -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-schema</artifactId>
        <version>{version}</version>
    </dependency>

    <!-- Optional: Backend and its dependency (Jackson 2.x example) -->
    <dependency>
        <groupId>org.sjf4j</groupId>
        <artifactId>sjf4j-backend-jackson2</artifactId>
        <version>{version}</version>
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
                        <version>{version}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>`
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
