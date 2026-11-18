import test from 'node:test'
import assert from 'node:assert/strict'
import { createZip } from '../../.vitepress/theme/generator/zip.ts'

test('creates a UTF-8 ZIP with independent Java files and a valid central directory', () => {
  const files = [
    { path: 'org/example/Cafe.java', content: 'class Cafe {}\n' },
    { path: 'org/example/Person.java', content: 'class Person { String name = "你好"; }\n' },
  ]
  const bytes = createZip(files)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  assert.equal(view.getUint32(0, true), 0x04034b50)
  const nameLength = view.getUint16(26, true)
  assert.equal(new TextDecoder().decode(bytes.subarray(30, 30 + nameLength)), files[0].path)
  const size = view.getUint32(18, true)
  assert.equal(new TextDecoder().decode(bytes.subarray(30 + nameLength, 30 + nameLength + size)), files[0].content)

  const end = bytes.length - 22
  assert.equal(view.getUint32(end, true), 0x06054b50)
  assert.equal(view.getUint16(end + 10, true), 2)
  const centralOffset = view.getUint32(end + 16, true)
  assert.equal(view.getUint32(centralOffset, true), 0x02014b50)
  assert.ok(bytes.length > size)
})

test('writes large generated files without exceeding argument-count limits', () => {
  const source = '/* ' + 'x'.repeat(200_000) + ' */\nclass BigExample {}\n'
  const files = [
    { path: 'org/example/BigExample.java', content: source },
    { path: 'org/example/Small.java', content: 'class Small {}\n' },
  ]
  const bytes = createZip(files)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const decoder = new TextDecoder()

  assert.equal(view.getUint32(0, true), 0x04034b50)
  const nameLength = view.getUint16(26, true)
  assert.equal(decoder.decode(bytes.subarray(30, 30 + nameLength)), files[0].path)
  const size = view.getUint32(18, true)
  assert.equal(size, new TextEncoder().encode(source).length)
  const bodyStart = 30 + nameLength
  assert.equal(decoder.decode(bytes.subarray(bodyStart, bodyStart + size)), source)

  const nextHeader = bodyStart + size
  assert.equal(view.getUint32(nextHeader, true), 0x04034b50)
  const end = bytes.length - 22
  assert.equal(view.getUint32(end, true), 0x06054b50)
  assert.equal(view.getUint16(end + 10, true), 2)
  const centralOffset = view.getUint32(end + 16, true)
  assert.equal(view.getUint32(centralOffset, true), 0x02014b50)
  assert.equal(view.getUint32(centralOffset + 42, true), 0)
  const firstCentralNameLen = view.getUint16(centralOffset + 28, true)
  const secondCentral = centralOffset + 46 + firstCentralNameLen
  assert.equal(view.getUint32(secondCentral, true), 0x02014b50)
  assert.equal(view.getUint32(secondCentral + 42, true), nextHeader)
})
