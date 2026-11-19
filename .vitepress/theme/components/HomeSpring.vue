<script setup lang="ts">
import CodePanel from './CodePanel.vue'
import { useSiteMessages } from '../i18n'
import { useData } from 'vitepress'
import { localizedLink } from '../../i18n/routes'

const t = useSiteMessages()
const { lang } = useData()

const mapperExample = `@CompiledMapper
public interface UserMapper {
    UserDto toDto(User user);
}`

const serviceExample = `@Service
public class UserService {
    @Autowired
    private UserMapper mapper;

    public UserDto convert(User user) {
        return mapper.toDto(user);
    }
}`
</script>

<template>
  <section class="home-spring" :aria-label="t.home.spring.label">
    <div class="home-spring-code">
      <CodePanel :title="t.home.spring.define" :code="mapperExample" />
      <CodePanel :title="t.home.spring.use" :code="serviceExample" />
    </div>
    <p class="home-spring-note">
      {{ t.home.spring.notes[0] }} <span aria-hidden="true">·</span>
      {{ t.home.spring.notes[1] }} <span aria-hidden="true">·</span>
      {{ t.home.spring.notes[2] }}
    </p>
    <p class="home-spring-more">
      <a :href="localizedLink('/docs/spring-integration', lang)">{{ t.home.spring.link }}</a>
    </p>
  </section>
</template>

<style scoped>
.home-spring {
  max-width: 980px;
  margin: 30px auto 0;
}

.home-spring-code {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 28px;
}

.home-spring-code :deep(.code-panel) {
  min-height: 270px;
}

.home-spring-note {
  margin: 23px auto 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.8;
  text-align: center;
}

.home-spring-note span {
  margin: 0 5px;
  color: var(--vp-c-text-3);
}

.home-spring-more {
  margin: 19px auto 0;
  text-align: center;
}

.home-spring-more a {
  color: var(--vp-c-brand-1);
  font-size: 16px;
  text-decoration: underline;
  text-decoration-color: var(--vp-c-divider);
  text-underline-offset: 3px;
}

.home-spring-more a:hover {
  text-decoration-color: currentColor;
}

@media (max-width: 760px) {
  .home-spring-code {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .home-spring-code :deep(.code-panel) {
    min-height: 0;
  }
}
</style>
