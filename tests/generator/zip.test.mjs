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
