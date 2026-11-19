<script setup lang="ts">
import { highlights } from '../data/benchmarks'
import { useSiteMessages } from '../i18n'

const t = useSiteMessages()
</script>

<template>
  <div class="benchmark-highlights">
    <div v-for="item in highlights" :key="item.id" class="benchmark-highlight">
      <span class="benchmark-highlight-category">{{ t.home.benchmarks.items[item.id].label }}</span>
      <strong>{{ item.speedup }}</strong>
      <small>{{ t.home.benchmarks.items[item.id].comparison }}</small>
    </div>
  </div>
  <p class="benchmark-caption">{{ t.home.benchmarks.caption }}</p>
</template>
