import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import {
  alternatePages,
  englishPath,
  localizedLink,
  localizedMarkdownLink,
  localePrefixes,
  switchLanguage,
  translatedPages
} from '../.vitepress/i18n/routes.ts'
import { en } from '../.vitepress/theme/i18n/en.ts'
import { zh } from '../.vitepress/theme/i18n/zh.ts'
import { capabilities } from '../.vitepress/theme/data/capabilities.ts'
import { highlights } from '../.vitepress/theme/data/benchmarks.ts'
import { createSidebar, docsNavigation } from '../.vitepress/locales/navigation.ts'

test('locale links only switch for published translations', () => {
  assert.equal(localizedLink('/', 'zh-CN'), '/zh/')
  assert.equal(localizedLink('/#explore-features', 'zh-CN'), '/zh/#explore-features')
  assert.equal(localizedLink('/?source=readme', 'zh-CN'), '/zh/?source=readme')
  assert.equal(localizedLink('/docs/binding', 'zh-CN'), '/zh/docs/binding')
  assert.equal(localizedLink('/docs/benchmarks', 'zh-CN'), '/docs/benchmarks')
  assert.equal(localizedLink('/generator', 'zh-CN'), '/generator')
  assert.equal(localizedLink('/', 'en-US'), '/')
  assert.equal(localizedLink('/', 'fr-FR'), '/')
  assert.equal(localizedLink('/zh/', 'zh-CN'), '/zh/')
  assert.equal(localizedLink('https://github.com/sjf4j-projects/sjf4j', 'zh-CN'),
    'https://github.com/sjf4j-projects/sjf4j')
  assert.equal(localizedLink('//example.org', 'zh-CN'), '//example.org')
})

test('homepage translation keys and feature identifiers remain in sync', () => {
  const keys = object => Object.keys(object).sort()
  assert.deepEqual(keys(en.home), keys(zh.home))
  assert.deepEqual(keys(en.home.sections), keys(zh.home.sections))
  assert.deepEqual(keys(en.home.hero), keys(zh.home.hero))
  assert.deepEqual(en.home.hero.panels.map(item => item.id),
    zh.home.hero.panels.map(item => item.id))
  assert.deepEqual(keys(en.home.capabilities), keys(zh.home.capabilities))
  assert.deepEqual(keys(en.home.capabilities.items), keys(zh.home.capabilities.items))
  for (const id of keys(en.home.capabilities.items)) {
    assert.deepEqual(keys(en.home.capabilities.items[id]), keys(zh.home.capabilities.items[id]))
  }
  assert.deepEqual(keys(en.home.benchmarks.items), keys(zh.home.benchmarks.items))
  assert.deepEqual(keys(en.home.spring), keys(zh.home.spring))
  assert.deepEqual(keys(en.code), keys(zh.code))
})

test('all shared homepage data is represented in every locale', () => {
  assert.deepEqual(
    capabilities.map(item => item.id).sort(),
    Object.keys(en.home.capabilities.items).sort()
  )
  assert.deepEqual(
    highlights.map(item => item.id).sort(),
    Object.keys(en.home.benchmarks.items).sort()
  )
  for (const item of capabilities) {
    assert.ok(item.path.startsWith('/docs/'))
    assert.ok(zh.home.capabilities.items[item.id].name)
  }
  for (const item of highlights) {
    assert.ok(zh.home.benchmarks.items[item.id].label)
  }
})


test('page-aware language switching preserves matching paths and falls back safely', () => {
  assert.equal(switchLanguage('/', 'zh-CN'), '/zh/')
  assert.equal(switchLanguage('/zh/', 'en-US'), '/')
  assert.equal(switchLanguage('/zh/#explore-features', 'en-US'), '/#explore-features')
  assert.equal(switchLanguage('/#explore-features', 'zh-CN'), '/zh/#explore-features')
  assert.equal(switchLanguage('/docs/binding#runtime-binding', 'zh-CN'),
    '/zh/docs/binding#runtime-binding')
  assert.equal(switchLanguage('/docs/binding', 'en-US'), '/docs/binding')
  assert.equal(switchLanguage('/zh/docs/binding?source=nav#example', 'en-US'),
    '/docs/binding?source=nav#example')
  assert.equal(englishPath('/zh/docs/binding'), '/docs/binding')
  assert.equal(englishPath('/zh/'), '/')
})

test('alternate metadata includes only published translation pairs', () => {
  assert.deepEqual(alternatePages('/'), { 'en-US': '/', 'zh-CN': '/zh/' })
  assert.deepEqual(alternatePages('/zh/'), { 'en-US': '/', 'zh-CN': '/zh/' })
  assert.deepEqual(alternatePages('/docs/binding'),
    { 'en-US': '/docs/binding', 'zh-CN': '/zh/docs/binding' })
  assert.deepEqual(alternatePages('/zh/docs/binding'),
    { 'en-US': '/docs/binding', 'zh-CN': '/zh/docs/binding' })
})

test('localized Markdown links fall back to English or map to published translations', () => {
  const from = 'zh/docs/binding.md'
  assert.equal(localizedMarkdownLink('/#explore-features', from, 'zh-CN'),
    '/zh/#explore-features')
  assert.equal(localizedMarkdownLink('/docs/installation', from, 'zh-CN'),
    '/zh/docs/installation')
  assert.equal(localizedMarkdownLink('./installation.md#gradle', from, 'zh-CN'),
    '/zh/docs/installation#gradle')
  assert.equal(localizedMarkdownLink('../generator', from, 'zh-CN'), '/generator')
  assert.equal(localizedMarkdownLink('../../', from, 'zh-CN'), '/zh/')
  assert.equal(localizedMarkdownLink('#usage', from, 'zh-CN'), '#usage')
  assert.equal(localizedMarkdownLink('https://example.com', from, 'zh-CN'),
    'https://example.com')
  assert.equal(localizedMarkdownLink('./diagram.svg', from, 'zh-CN'), './diagram.svg')
  assert.equal(localizedMarkdownLink('/docs/installation', from, 'en-US'),
    '/docs/installation')
})

test('translated route registry matches existing Markdown in both directions', () => {
  const root = resolve('.')
  const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const next = join(dir, entry.name)
    return entry.isDirectory() ? walk(next) : [next]
  })
  const mdRoute = path => path.endsWith('/index.md')
    ? path.slice(0, -'index.md'.length)
    : path.replace(/\.md$/, '')

  for (const [locale, registered] of Object.entries(translatedPages)) {
    const prefix = localePrefixes[locale]
    assert.ok(prefix, `Unknown locale: ${locale}`)
    const dirname = prefix.slice(1)
    assert.ok(dirname, 'Translation must not use the English root directory')
    const sourceDir = resolve(root, dirname)
    assert.ok(existsSync(sourceDir), `Missing locale directory: ${dirname}`)

    const realPages = walk(sourceDir)
      .filter(path => path.endsWith('.md'))
      .map(path => mdRoute('/' + relative(sourceDir, path).replaceAll('\\', '/')))
      .sort()
    const listed = [...registered].sort()
    assert.deepEqual(listed, realPages, `Unregistered or missing ${locale} page`)

    for (const route of listed) {
      const englishFile = route === '/' ? 'index.md' : route.slice(1) + '.md'
      assert.ok(existsSync(join(root, englishFile)),
        `Missing English source page: ${englishFile}`)
    }
  }
})


test('English and Chinese sidebar entries share the same page inventory', () => {
  const english = createSidebar('en-US')
  const chinese = createSidebar('zh-CN')
  assert.equal(english.length, chinese.length)

  const documentedPaths = new Set()
  for (let index = 0; index < docsNavigation.length; index++) {
    const items = docsNavigation[index].pages
    assert.equal(english[index].items.length, items.length)
    assert.equal(chinese[index].items.length, items.length)

    items.forEach((item, pageIndex) => {
      const { link } = item
      if (link.startsWith('/')) {
        assert.ok(!documentedPaths.has(link), `Duplicate documentation navigation URL: ${link}`)
        documentedPaths.add(link)
        assert.ok(existsSync(resolve('.', link.slice(1) + '.md')),
          `Missing documentation page: ${link}`)
      }
      assert.equal(english[index].items[pageIndex].link, link)
      assert.equal(chinese[index].items[pageIndex].link, localizedLink(link, 'zh-CN'))
      assert.ok(item.title.en.length > 0 && item.title.zh.length > 0)
    })
  }
})

test('Getting Started translation routes, anchors, SEO, and code samples stay aligned', () => {
  const englishPath = '/docs/getting-started'
  const chinesePath = '/zh/docs/getting-started'
  assert.equal(localizedLink(englishPath, 'zh-CN'), chinesePath)
  assert.equal(localizedLink(englishPath + '#quickstart', 'zh-CN'), chinesePath + '#quickstart')
  assert.equal(switchLanguage(englishPath + '#binding', 'zh-CN'), chinesePath + '#binding')
  assert.equal(switchLanguage(chinesePath + '#binding', 'en-US'), englishPath + '#binding')
  assert.equal(localizedMarkdownLink(englishPath, 'zh/docs/getting-started.md', 'zh-CN'),
    chinesePath)
  assert.deepEqual(alternatePages(chinesePath),
    { 'en-US': englishPath, 'zh-CN': chinesePath })

  const english = readFileSync('docs/getting-started.md', 'utf8')
  const chinese = readFileSync('zh/docs/getting-started.md', 'utf8')
  const samples = page => [...page.matchAll(/\x60{3}[^\n]*\n[\s\S]*?\n\x60{3}/g)].map(match => match[0])
  assert.ok(samples(english).length > 0)
  assert.ok(samples(chinese).length > 0)
  // The README sync updates English independently; freshness is checked via
  // translationSourceSha and must not block an upstream README update.

  const anchors = page => [...page.matchAll(/^#{1,3} .+?\{#([^}]+)\}$/gm)]
    .map(match => match[1])
  const translatedAnchors = anchors(chinese)
  assert.equal(new Set(translatedAnchors).size, translatedAnchors.length)
  for (const anchor of ['quickstart', 'explore-features', 'binding', 'navigating',
    'validating', 'mapping', 'patching', 'modeling', 'enjoy-compiled-apis',
    'benchmarks', 'contributing']) {
    assert.ok(translatedAnchors.includes(anchor), `Missing stable anchor: ${anchor}`)
  }
})

test('Installation translation supports navigation, deep links, and freshness tracking', () => {
  const english = '/docs/installation'
  const chinese = '/zh/docs/installation'
  assert.equal(localizedLink(english, 'zh-CN'), chinese)
  assert.equal(localizedLink(english + '#compiled-apis', 'zh-CN'),
    chinese + '#compiled-apis')
  assert.equal(switchLanguage(english + '#spring-integration', 'zh-CN'),
    chinese + '#spring-integration')
  assert.equal(switchLanguage(chinese + '#spring-boot', 'en-US'),
    english + '#spring-boot')
  assert.equal(localizedMarkdownLink(english + '#modules',
    'zh/docs/getting-started.md', 'zh-CN'), chinese + '#modules')
  assert.deepEqual(alternatePages(chinese), {
    'en-US': english,
    'zh-CN': chinese,
  })

  const page = readFileSync('zh/docs/installation.md', 'utf8')
  const source = readFileSync('docs/installation.md', 'utf8')
  assert.match(page, /^translationSourceSha:\s*["']?[a-f0-9]{40}["']?$/m)
  assert.match(page, /:::\s*code-group/)
  assert.match(page, /sjf4j-spring-boot-starter/)
  assert.match(page, /annotationProcessor/)

  const headings = [...page.matchAll(/^#{1,3} .+?\{#([^}]+)\}$/gm)]
    .map(match => match[1])
  assert.deepEqual(headings, [
    'installation', 'quick-setup', 'modules', 'backends', 'compiled-apis',
    'spring-integration', 'spring-framework', 'spring-boot'
  ])
  assert.match(source, /^# Installation$/m)
})

test('Modeling translation is registered with stable sections and unchanged examples', () => {
  const original = '/docs/modeling'
  const localized = '/zh/docs/modeling'
  assert.equal(localizedLink(original, 'zh-CN'), localized)
  assert.equal(switchLanguage(original + '#three-kinds-of-nodes', 'zh-CN'),
    localized + '#three-kinds-of-nodes')
  assert.equal(switchLanguage(localized + '#custom-value-types', 'en-US'),
    original + '#custom-value-types')
  assert.deepEqual(alternatePages(localized), {
    'en-US': original,
    'zh-CN': localized,
  })

  const english = readFileSync('docs/modeling.md', 'utf8')
  const chinese = readFileSync('zh/docs/modeling.md', 'utf8')
  const codeBlocks = page => [...page.matchAll(/```[^\n]*\n[\s\S]*?\n```/g)]
    .map(match => match[0])
  assert.deepEqual(codeBlocks(chinese), codeBlocks(english))

  const anchors = [...chinese.matchAll(/^#{1,3} .+?\{#([^}]+)\}$/gm)]
    .map(match => match[1])
  for (const anchor of ['understanding-obnt', 'three-kinds-of-nodes',
    'json-semantics-vs-java-representations', 'object-nodes', 'array-nodes',
    'value-nodes', 'working-with-nodes', 'custom-value-types', 'beyond-modeling']) {
    assert.ok(anchors.includes(anchor), `Missing stable Modeling anchor: ${anchor}`)
  }
})

test('Compiled APIs translation includes the shared component and stable anchors', () => {
  const english = '/docs/compiled'
  const chinese = '/zh/docs/compiled'
  assert.equal(localizedLink(english, 'zh-CN'), chinese)
  assert.equal(switchLanguage(english + '#runtime-vs-compiled', 'zh-CN'),
    chinese + '#runtime-vs-compiled')
  assert.equal(switchLanguage(chinese + '#compilation-limits-and-fallback', 'en-US'),
    english + '#compilation-limits-and-fallback')
  assert.deepEqual(alternatePages(chinese), { 'en-US': english, 'zh-CN': chinese })

  const page = readFileSync('zh/docs/compiled.md', 'utf8')
  const source = readFileSync('docs/compiled.md', 'utf8')
  assert.ok(page.includes('<CompiledCodeComparison />'))
  const blocks = value => [...value.matchAll(/```[^\n]*\n[\s\S]*?\n```/g)]
    .map(match => match[0])
  assert.deepEqual(blocks(page), blocks(source))
  for (const fragment of ['how-it-works', 'available-compiled-apis',
    'create-and-reuse-instances', 'inspect-generated-source',
    'runtime-vs-compiled', 'compilation-limits-and-fallback']) {
    assert.ok(page.includes(`{#${fragment}}`), `Missing compiled anchor ${fragment}`)
  }
})

test('Binding translation preserves code, compatible semantics and page routing', () => {
  const english = '/docs/binding'
  const chinese = '/zh/docs/binding'
  assert.equal(localizedLink(english, 'zh-CN'), chinese)
  assert.equal(switchLanguage(english + '#binding-compatibility', 'zh-CN'),
    chinese + '#binding-compatibility')
  assert.equal(switchLanguage(chinese + '#polymorphic-binding', 'en-US'),
    english + '#polymorphic-binding')
  assert.deepEqual(alternatePages(chinese), {
    'en-US': english,
    'zh-CN': chinese,
  })

  const source = readFileSync('docs/binding.md', 'utf8')
  const localized = readFileSync('zh/docs/binding.md', 'utf8')
  const blocks = page => [...page.matchAll(/```[^\n]*\n[\s\S]*?\n```/g)]
    .map(match => match[0])
  assert.deepEqual(blocks(localized), blocks(source))
  for (const fragment of ['runtime-binding', 'compiled-binding', 'object-binding',
    'polymorphic-binding', 'discriminator-key', 'discriminator-path',
    'json-type', 'value-codecs', 'backends-and-streaming', 'configuration',
    'binding-compatibility']) {
    assert.ok(localized.includes(`{#${fragment}}`),
      `Missing stable Binding anchor: ${fragment}`)
  }
})
