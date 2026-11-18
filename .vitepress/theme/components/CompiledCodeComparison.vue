<script setup lang="ts">
import CodePanel from './CodePanel.vue'

const sourceCode = `@CompiledNavigator
interface UserNavigator {
    @GetByPath("$.address.city")
    String getCity(User user);
}`

const generatedCode = `public final class UserNavigator_Impl
        implements UserNavigator {

    @Override
    public String getCity(User user) {
        if (user == null) return null;
        Address a = user.address;
        return a == null ? null : a.city;
    }
}`
</script>

<template>
  <div class="compiled-code-comparison" aria-label="Compiled Navigator source and generated Java example">
    <CodePanel title="Define Interface" :code="sourceCode" />
    <CodePanel title="Generated Code" :code="generatedCode" />
  </div>
</template>

<style scoped>
.compiled-code-comparison {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin: 22px 0 10px;
}
</style>
