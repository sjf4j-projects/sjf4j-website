import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const read = path => readFileSync(path, 'utf8')
// Strip fenced examples before checking human-authored terminology.
const stripFencedCode = markdown => markdown.replace(/```[\s\S]*?```/g, '')


test('Chinese documentation keeps canonical API family and node names', () => {
  const forbidden = [
    '对象节点', '数组节点', '值节点',
    '运行时 API', '编译式 API',
    '运行时导航', '编译式导航',
    '运行时校验', '编译式校验',
    '运行时映射', '编译式映射',
    '编译式绑定', '值编解码器',
  ]

  for (const file of readdirSync('zh/docs').filter(name => name.endsWith('.md'))) {
    // Check prose only. Examples are shared with English and must stay verbatim.
    const prose = stripFencedCode(read(join('zh/docs', file)))
    for (const term of forbidden) {
      assert.ok(!prose.includes(term), `${file} should use the English technical name instead of ${term}`)
    }
  }
})

test('Chinese homepage and sidebar use the same terminology', () => {
  const home = read('.vitepress/theme/i18n/zh.ts')
  const navigation = read('.vitepress/locales/navigation.ts')

  for (const node of ['Object Node', 'Array Node', 'Value Node']) {
    assert.ok(home.includes(node), `Homepage is missing ${node}`)
    assert.ok(read('zh/docs/modeling.md').includes(node), `Modeling page is missing ${node}`)
  }
  for (const label of ['Runtime API', 'Compiled API']) {
    assert.ok(home.includes(label), `Homepage is missing ${label}`)
  }
  for (const [en, zh] of [
    ['Compiled APIs', 'Compiled APIs'],
    ['Value Codecs', 'Value Codecs'],
    ['External Nodes', 'External Nodes'],
  ]) {
    assert.ok(navigation.includes(`en: '${en}', zh: '${zh}'`))
  }
})

test('terminology checks ignore code fences but retain prose', () => {
  const markdown = [
    '文档正文不含已弃用术语。',
    '```java',
    'String type = "对象节点"; // 数组节点' ,
    '```',
    '代码块之后继续说明。',
  ].join('\n')

  const prose = stripFencedCode(markdown)
  assert.ok(!prose.includes('对象节点'))
  assert.ok(!prose.includes('数组节点'))
  assert.ok(prose.includes('文档正文不含已弃用术语。'))
  assert.ok(prose.includes('代码块之后继续说明。'))
  assert.ok(stripFencedCode('这里描述对象节点。').includes('对象节点'))
})
