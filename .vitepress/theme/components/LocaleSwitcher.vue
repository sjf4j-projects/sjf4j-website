<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { switchLanguage } from '../../i18n/routes'

defineProps<{ mobile?: boolean }>()

const route = useRoute()
const { site, localeIndex, theme, hash } = useData()
const details = ref<HTMLDetailsElement | null>(null)
const options = computed(() => Object.entries(site.value.locales).map(([key, locale]) => ({
  key,
  label: locale.label,
  href: switchLanguage(route.path + hash.value, locale.lang || (key === 'root' ? 'en-US' : key)),
  active: key === localeIndex.value
})))
const current = computed(() => options.value.find(option => option.active))

function closeMenu() {
  if (details.value) details.value.open = false
}
</script>

<template>
  <nav v-if="mobile" class="locale-mobile" :aria-label="theme.langMenuLabel || 'Change language'">
    <span class="mobile-title">{{ theme.langMenuLabel || 'Change language' }}</span>
    <div class="mobile-options">
      <template v-for="option in options" :key="option.key">
        <span v-if="option.active" class="mobile-active" aria-current="page">{{ option.label }}</span>
        <a v-else :href="option.href">{{ option.label }}</a>
      </template>
    </div>
  </nav>

  <details v-else ref="details" class="locale-switcher" @keydown.esc="closeMenu">
    <summary :aria-label="theme.langMenuLabel || 'Change language'">
      <span aria-hidden="true" class="vpi-languages lang-icon"></span>
      <span class="lang-label">{{ current?.label }}</span>
      <span aria-hidden="true" class="vpi-chevron-down chevron"></span>
    </summary>
    <div class="locale-options">
      <template v-for="option in options" :key="option.key">
        <span v-if="option.active" class="selected" aria-current="page">{{ option.label }}</span>
        <a v-else :href="option.href" @click="closeMenu">{{ option.label }}</a>
      </template>
    </div>
  </details>
</template>

<style scoped>
.locale-switcher {
  position: relative;
  display: none;
  flex-shrink: 0;
  height: var(--vp-nav-height);
  font-size: 14px;
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .locale-switcher { display: flex; align-items: center; }
}

.locale-switcher summary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  list-style: none;
  border-radius: 6px;
  cursor: pointer;
}

/* The divider belongs to the switcher itself, not a fragile navbar sibling selector. */
@media (min-width: 768px) {
  .locale-switcher summary::before {
    content: '';
    display: block;
    flex: 0 0 1px;
    height: 24px;
    margin-left: -8px;
    margin-right: 8px;
    background: var(--vp-c-divider);
  }
}

.locale-switcher summary::-webkit-details-marker { display: none; }
.locale-switcher summary:hover { color: var(--vp-c-brand-1); }
.locale-switcher summary:focus-visible,
.locale-options a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }

.lang-icon { font-size: 16px; }
@media (min-width: 768px) and (max-width: 1279px) {
  .lang-label { display: none; }
}
.lang-label { font-weight: 500; }
.chevron { width: 14px; height: 14px; flex: 0 0 14px; color: var(--vp-c-text-3); }

.locale-options {
  position: absolute;
  z-index: 50;
  top: calc(100% - 5px);
  right: 0;
  min-width: 140px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
}

.locale-options a,
.locale-options .selected {
  display: block;
  padding: 8px 12px;
  border-radius: 5px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.locale-options a:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
}

.locale-options .selected { color: var(--vp-c-brand-1); font-weight: 600; }

.locale-mobile { margin-top: 24px; color: var(--vp-c-text-1); font-size: 14px; }
.mobile-title { display: block; margin-bottom: 10px; color: var(--vp-c-text-2); font-weight: 600; }
.mobile-options { display: flex; flex-wrap: wrap; gap: 16px; }
.mobile-options a { color: var(--vp-c-brand-1); text-decoration: none; }
.mobile-active { font-weight: 700; }
</style>
