import test from 'node:test'
import assert from 'node:assert/strict'
import { localizedLink } from '../.vitepress/i18n/routes.ts'
import { en } from '../.vitepress/theme/i18n/en.ts'
import { zh } from '../.vitepress/theme/i18n/zh.ts'
import { capabilities } from '../.vitepress/theme/data/capabilities.ts'
import { highlights } from '../.vitepress/theme/data/benchmarks.ts'

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
