import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_OPTIONS, generateJava } from '../../.vitepress/theme/generator/index.ts'

function generate(schema, changes = {}, libraries = []) {
  return generateJava(JSON.stringify(schema), { ...DEFAULT_OPTIONS, ...changes }, libraries.map(JSON.stringify))
}

function expectSuccess(result) {
  assert.deepEqual(result.diagnostics.filter((d) => d.severity === 'error'), [])
  assert.ok(result.files.length > 0)
}

const order = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Order',
  type: 'object',
  required: ['id', 'amount'],
  properties: {
    id: { type: 'string', description: 'Order identifier.' },
    amount: { type: 'number' },
    customer: { type: 'object', properties: { email: { type: 'string' } } },
    items: { type: 'array', items: { type: 'object', properties: { sku: { type: 'string' } } } },
    status: { type: 'string', enum: ['new', 'in-progress', 'done'] },
  },
}

test('generates independent Java 8 POJO files with a real Java enum', () => {
  const result = generate(order)
  expectSuccess(result)
  assert.deepEqual(result.files.map((f) => f.path), [
    'org/example/generated/Order.java',
    'org/example/generated/Customer.java',
    'org/example/generated/OrderItem.java',
    'org/example/generated/Status.java',
  ])
  const root = result.files[0].content
  assert.match(root, /public class Order \{/)
  assert.match(root, /public String id;/)
  assert.match(root, /public BigDecimal amount;/)
  assert.match(root, /public Customer customer;/)
  assert.match(root, /public List<OrderItem> items;/)
  assert.match(root, /public Status status;/)
  assert.doesNotMatch(root, /CompiledPath|CompiledNodes|@NodeBinding/)
  const enumCode = result.files[3].content
  assert.match(enumCode, /@NodeValue/)
  assert.match(enumCode, /IN_PROGRESS\("in-progress"\)/)
  assert.match(enumCode, /case "in-progress": return IN_PROGRESS;/)
  assert.match(enumCode, /@RawToValue/)
})

test('honors explicit root class name and Java field aliases', () => {
  const result = generate({
    title: 'IgnoredTitle', type: 'object',
    properties: { 'line-item': { type: 'string' }, class: { type: 'boolean' } },
  }, { className: 'MyDocument', accessors: 'methods' })
  expectSuccess(result)
  assert.match(result.files[0].path, /MyDocument\.java$/)
  assert.match(result.files[0].content, /@NodeProperty\("line-item"\)/)
  assert.match(result.files[0].content, /private String lineItem;/)
  assert.match(result.files[0].content, /@NodeProperty\("class"\)/)
  assert.match(result.files[0].content, /private Boolean class_;/)
  assert.match(result.files[0].content, /public String getLineItem\(\)/)
})

test('resolves local and external $ref while retaining recursive type identity', () => {
  const schema = {
    $id: 'https://example.test/order.json',
    title: 'Envelope',
    type: 'object',
    properties: {
      shipment: { $ref: 'common.json#/$defs/Shipment' },
      root: { $ref: '#/$defs/Node' },
    },
    $defs: {
      Node: {
        type: 'object',
        properties: { next: { $ref: '#/$defs/Node' } },
      },
    },
  }
  const library = {
    $id: 'common.json',
    $defs: {
      Shipment: { type: 'object', properties: { tracking: { type: 'string' } } },
    },
  }
  const result = generate(schema, {}, [library])
  expectSuccess(result)
  assert.equal(result.files.length, 3)
  assert.match(result.files[0].content, /Shipment shipment;/)
  assert.match(result.files[0].content, /Node root;/)
  assert.match(result.files.find((f) => f.path.endsWith('/Node.java')).content, /Node next;/)
})

test('generates JOJO and optional validation annotations without treating required as non-null', () => {
  const schema = {
    title: 'Profile', type: 'object', required: ['nullable', 'name'],
    properties: {
      nullable: { type: ['string', 'null'] },
      name: { type: 'string', minLength: 2, pattern: '^A' },
      age: { type: 'integer', minimum: 0 },
    },
  }
  const result = generate(schema, { model: 'jojo', validation: true, validationNamespace: 'jakarta' })
  expectSuccess(result)
  const code = result.files[0].content
  assert.match(code, /extends JsonObject/)
  assert.match(code, /@NotNull\s+@Size\(min = 2\)\s+@Pattern\(regexp = "\^A"\)\s+public String name;/)
  assert.doesNotMatch(code, /@NotNull\s+public String nullable;/)
  assert.match(code, /@Size\(min = 2\)/)
  assert.match(code, /@Pattern\(regexp = "\^A"\)/)
  assert.match(code, /@Min\(0L\)/)
})

test('supports safe allOf property composition and reports conflicts', () => {
  const valid = generate({
    title: 'Joined', allOf: [
      { type: 'object', properties: { id: { type: 'string' } } },
      { type: 'object', required: ['qty'], properties: { qty: { type: 'integer' } } },
    ],
  })
  expectSuccess(valid)
  assert.match(valid.files[0].content, /String id;/)
  assert.match(valid.files[0].content, /Long qty;/)

  const invalid = generate({
    title: 'Joined', allOf: [
      { properties: { id: { type: 'string' } } },
      { properties: { id: { type: 'integer' } } },
    ],
  })
  assert.equal(invalid.files.length, 0)
  assert.match(invalid.diagnostics[0].message, /Conflicting allOf/)
})

test('rejects unsupported compositions and missing documents instead of silently guessing', () => {
  const unsupported = generate({ type: 'object', properties: { choice: {
    oneOf: [{ type: 'string' }, { type: 'number' }],
  } } })
  assert.equal(unsupported.files.length, 0)
  assert.match(unsupported.diagnostics[0].message, /Unsupported composition/)

  const missing = generate({ type: 'object', properties: { address: { $ref: 'missing.json' } } })
  assert.equal(missing.files.length, 0)
  assert.match(missing.diagnostics[0].message, /Unresolved external/)
})

test('rejects malformed JSON and unsafe Java package names', () => {
  assert.equal(generateJava('{"broken":', DEFAULT_OPTIONS).files.length, 0)
  const invalid = generate(order, { packageName: 'org.class.generated' })
  assert.equal(invalid.files.length, 0)
  assert.match(invalid.diagnostics[0].message, /package/)
})

test('uses explicit supported field overrides', () => {
  const result = generate(
    { type: 'object', properties: { count: { type: 'integer' } } },
    { fieldTypes: { '#/properties/count': 'Integer' } },
  )
  expectSuccess(result)
  assert.match(result.files[0].content, /Integer count;/)
})
