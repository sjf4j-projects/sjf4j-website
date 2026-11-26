import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const dist = '.vitepress/dist'
const read = path => readFileSync(path, 'utf8')

test('llms.txt follows Markdown index conventions and Lighthouse checks', () => {
  const content = read('public/llms.txt')
  assert.match(content, /^# [^\n]+\n\n> /)
  assert.ok(content.length >= 50)
  assert.match(content, /\[.+\]\(.+\)/)
  let inSection = false
  let count = 0
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      inSection = true
    } else if (inSection && line.trim()) {
      const link = /^- \[[^\]]+\]\((https:\/\/[^)]+)\)(?:: .+)?$/.exec(line)
      assert.ok(link, `Expected a Markdown link list item: ${line}`)
      const url = new URL(link[1])
      if (url.origin === 'https://sjf4j.org') {
        const path = url.pathname.slice(1)
        const candidates = [path, path + '.html', join(path, 'index.html')]
        assert.ok(candidates.some(candidate => existsSync(join(dist, candidate))),
          `Missing built documentation target: ${url.href}`)
      }
      count++
    }
  }
  assert.ok(count > 0)
})

test('LLM documentation files are copied unchanged to the site root', () => {
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const source = read(join('public', name))
    assert.match(source, /^# /)
    assert.match(source, /\[.+\]\(.+\)/)
    assert.equal(read(join(dist, name)), source)
  }
})
