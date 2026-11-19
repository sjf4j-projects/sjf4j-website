import { computed } from 'vue'
import { useData } from 'vitepress'

// Shared homepage components stay language-neutral. Only their text is localized.
export function useChineseHome() {
  const { lang } = useData()
  return computed(() => lang.value.startsWith('zh'))
}
