<script setup lang="ts">
import CodePanel from './CodePanel.vue'

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
  <section class="home-spring" aria-label="Spring Boot integration example">
    <div class="home-spring-code">
      <CodePanel title="Define Interface" :code="mapperExample" />
      <CodePanel title="Use in Spring" :code="serviceExample" />
    </div>
    <p class="home-spring-note">
      Automatic bean registration <span aria-hidden="true">·</span>
      Compile-time generated implementations <span aria-hidden="true">·</span>
      Standard Spring dependency injection
    </p>
    <p class="home-spring-more">
      <a href="/docs/spring-integration">Spring Integration</a>
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
