import { computed } from 'vue'
import { useData } from 'vitepress'
import { en } from './en'
import { zh } from './zh'
import type { SiteMessages } from './types'

const messages: Record<string, SiteMessages> = { 'en-US': en, 'zh-CN': zh }

// Register another language here when its locale is added to VitePress.
// Unknown locales fall back to English rather than duplicating copy in components.
export function useSiteMessages() {
  const { lang } = useData()
  return computed(() => messages[lang.value] ?? en)
}
