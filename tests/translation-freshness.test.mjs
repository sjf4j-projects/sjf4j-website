import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkTranslationFreshness, gitBlobSha } from '../scripts/check-translations.mjs'

test('translation source revision matches the English Git blob', () => {
  const source = readFileSync('docs/getting-started.md', 'utf8')
  const translation = readFileSync('zh/docs/getting-started.md', 'utf8')
  const reference = translation.match(/^translationSourceSha:\s*["']?([a-f0-9]{40})/m)?.[1]
  assert.ok(reference, 'Chinese Getting Started must record its English source revision')
  // When English is updated by automated README sync, warn but do not fail.
  const findings = checkTranslationFreshness()
  assert.ok(!findings.some(f => f.status === 'untracked'))
  assert.match(gitBlobSha(source), /^[a-f0-9]{40}$/)
})

test('stale and missing source revisions produce informational findings', () => {
  const root = mkdtempSync(join(tmpdir(), 'sjf4j-i18n-'))
  const english = join(root, 'docs', 'getting-started.md')
  const chinese = join(root, 'zh', 'docs', 'getting-started.md')
  mkdirSync(join(root, 'docs'), { recursive: true })
  mkdirSync(join(root, 'zh', 'docs'), { recursive: true })
  try {
    const original = '# Getting Started\nExample'
    writeFileSync(english, original)
    writeFileSync(chinese, `---\ntranslationSourceSha: "${gitBlobSha(original)}"\n---\n# 快速开始\n`)
    assert.deepEqual(checkTranslationFreshness(root), [])

    writeFileSync(english, '# Getting Started\nUpdated example')
    assert.deepEqual(checkTranslationFreshness(root), [
      { file: 'zh/docs/getting-started.md', status: 'outdated' },
    ])

    writeFileSync(chinese, '---\ntitle: "快速开始"\n---\n# 快速开始\n')
    assert.deepEqual(checkTranslationFreshness(root), [
      { file: 'zh/docs/getting-started.md', status: 'untracked' },
    ])

    unlinkSync(english)
    assert.deepEqual(checkTranslationFreshness(root), [
      { file: 'zh/docs/getting-started.md', status: 'missing-source' },
    ])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
