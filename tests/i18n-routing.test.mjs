import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
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
  assert.equal(localizedLink('/docs/binding', 'zh-CN'), '/docs/binding')
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
  assert.equal(switchLanguage('/docs/binding#runtime-binding', 'zh-CN'), '/zh/')
  assert.equal(switchLanguage('/docs/binding', 'en-US'), '/docs/binding')
  assert.equal(switchLanguage('/zh/docs/binding?source=nav#example', 'en-US'),
    '/docs/binding?source=nav#example')
  assert.equal(englishPath('/zh/docs/binding'), '/docs/binding')
  assert.equal(englishPath('/zh/'), '/')
})

test('alternate metadata includes only published translation pairs', () => {
  assert.deepEqual(alternatePages('/'), { 'en-US': '/', 'zh-CN': '/zh/' })
  assert.deepEqual(alternatePages('/zh/'), { 'en-US': '/', 'zh-CN': '/zh/' })
  assert.deepEqual(alternatePages('/docs/binding'), { 'en-US': '/docs/binding' })
  assert.deepEqual(alternatePages('/zh/docs/binding'), { 'en-US': '/docs/binding' })
})

test('localized Markdown links fall back to English or map to published translations', () => {
  const from = 'zh/docs/binding.md'
  assert.equal(localizedMarkdownLink('/#explore-features', from, 'zh-CN'),
    '/zh/#explore-features')
  assert.equal(localizedMarkdownLink('/docs/installation', from, 'zh-CN'),
    '/docs/installation')
  assert.equal(localizedMarkdownLink('./installation.md#gradle', from, 'zh-CN'),
    '/docs/installation.md#gradle')
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
