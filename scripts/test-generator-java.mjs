/**
 * Compile generated Java against an actual SJF4J core JAR.
 * Usage: node --experimental-strip-types scripts/test-generator-java.mjs <sjf4j-core.jar>
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { DEFAULT_OPTIONS, generateJava } from '../.vitepress/theme/generator/index.ts'

const jar = process.argv[2]
if (!jar) throw new Error('Pass the path to an SJF4J core JAR.')

const baseSchema = {
  title: 'Checkout', type: 'object',
  properties: {
    orderId: { type: 'string' },
    items: { type: 'array', items: {
      type: 'object', properties: { quantity: { type: 'integer' } },
    } },
    status: { type: 'string', enum: ['new', 'in-progress'] },
  },
}

const directory = mkdtempSync(join(tmpdir(), 'sjf4j-generator-'))
try {
  const inputs = []
  for (const model of ['pojo', 'jojo']) {
    const result = generateJava(JSON.stringify(baseSchema), {
      ...DEFAULT_OPTIONS, model,
      packageName: 'org.example.' + model,
      accessors: model === 'pojo' ? 'methods' : 'fields',
    })
    assert.ok(result.files.length > 0, JSON.stringify(result.diagnostics))
    for (const file of result.files) {
      const path = join(directory, file.path)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, file.content)
      inputs.push(path)
    }
  }
  const output = join(directory, 'classes')
  mkdirSync(output, { recursive: true })
  const javac = spawnSync('javac', ['--release', '8', '-cp', jar, '-d', output, ...inputs], {
    encoding: 'utf8',
  })
  assert.equal(javac.status, 0, javac.stdout + '\n' + javac.stderr)
  console.log('Generated POJO, JOJO and enum sources compile with SJF4J (Java 8 source compatibility).')
} finally {
  rmSync(directory, { recursive: true, force: true })
}
