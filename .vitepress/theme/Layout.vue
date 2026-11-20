<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import LocaleSwitcher from './components/LocaleSwitcher.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after><LocaleSwitcher /></template>
    <template #nav-screen-content-after><LocaleSwitcher mobile /></template>
  </DefaultTheme.Layout>
</template>
