import { asObject, isObject, optionalString, SchemaResolver } from './schema.ts'
import type {
  Diagnostic, EnumConstant, GeneratorOptions, JavaField, JavaModel, ModelResult,
  SchemaLocation, SchemaNode, SchemaObject,
} from './types.ts'

const RESERVED = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
  'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
  'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
  'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
  'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false',
  'null', '_', 'record', 'sealed', 'permits', 'yield', 'var',
])

function words(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .split(/[^A-Za-z0-9$]+/)
    .filter(Boolean)
}

function capital(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function className(value: string): string {
  const parts = words(value)
  const result = parts.map(capital).join('') || 'GeneratedType'
  return /^[A-Za-z_$]/.test(result) && !RESERVED.has(result)
    ? result
    : 'Type' + result
}

export function fieldName(value: string): string {
  const parts = words(value)
  if (!parts.length) return 'value'
  const valueName = parts[0].toLowerCase() + parts.slice(1).map(capital).join('')
  const result = /^[A-Za-z_$]/.test(valueName) ? valueName : 'field' + capital(valueName)
  return RESERVED.has(result) ? result + '_' : result
}

export function validPackageName(value: string): boolean {
  return !value || value.split('.').every((part) => /^[A-Za-z_$][\w$]*$/.test(part) && !RESERVED.has(part))
}

const FIELD_OVERRIDES = new Set([
  'String', 'Boolean', 'Integer', 'Long', 'Double', 'BigDecimal', 'BigInteger',
  'LocalDate', 'OffsetDateTime', 'LocalDateTime', 'Instant', 'UUID', 'URI',
  'JsonObject', 'Object',
])

type Property = { schema: SchemaNode; location: SchemaLocation }
type Shape = { properties: Map<string, Property>; required: Set<string> }

function typeOfSchema(schema: SchemaObject, at: string): string | undefined {
  const value = schema.type
  if (value === undefined) {
    if (isObject(schema.properties) || Array.isArray(schema.allOf)) return 'object'
    if (schema.items !== undefined) return 'array'
    if (Array.isArray(schema.enum) && schema.enum.every((v) => typeof v === 'string')) return 'string'
    return undefined
  }
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    const alternatives = value.filter((v) => v !== 'null')
    if (alternatives.length === 1) return alternatives[0]
  }
  throw new Error('Unsupported union or invalid type at ' + at + '.')
}

function nullable(schema: SchemaObject): boolean {
  return Array.isArray(schema.type) && schema.type.includes('null')
    || Array.isArray(schema.enum) && schema.enum.includes(null)
    || schema.type === 'null'
}

function assertNoUnsupportedAlternatives(schema: SchemaObject, at: string): void {
  if (schema.oneOf !== undefined || schema.anyOf !== undefined || schema.not !== undefined
    || schema.$dynamicRef !== undefined || schema.$recursiveRef !== undefined) {
    throw new Error('Unsupported composition at ' + at + ': oneOf, anyOf, not and dynamic references require explicit modeling.')
  }
}

export function buildModel(resolver: SchemaResolver, options: GeneratorOptions): ModelResult {
  if (!validPackageName(options.packageName.trim())) throw new Error('Invalid Java package name.')
  if (options.className.trim() && !/^[A-Za-z_$][\w$]*$/.test(options.className.trim())) {
    throw new Error('Class name must be a valid Java identifier.')
  }
  if (options.className.trim() && RESERVED.has(options.className.trim())) {
    throw new Error('Class name is a Java reserved word.')
  }

  const models: JavaModel[] = []
  const warnings: Diagnostic[] = []
  const names = new Set<string>()
  const known = new Map<string, string>()

  function nameFor(base: string): string {
    const preferred = className(base)
    let result = preferred
    for (let number = 2; names.has(result); number++) result = preferred + number
    names.add(result)
    return result
  }

  function resolve(location: SchemaLocation): SchemaLocation {
    const result = resolver.follow(location)
    if (result.pointer !== '#' && isObject(result.schema) && typeof result.schema.$id === 'string') {
      throw new Error('Nested $id resources are not supported at ' + result.pointer + '.')
    }
    return result
  }

  function objectShape(location: SchemaLocation, stack = new Set<string>()): Shape {
    const here = resolve(location)
    const identity = resolver.identity(here)
    if (stack.has(identity)) throw new Error('Cyclic allOf composition at ' + here.pointer)
    const next = new Set(stack)
    next.add(identity)
    const schema = asObject(here.schema)
    assertNoUnsupportedAlternatives(schema, here.pointer)
    const kind = typeOfSchema(schema, here.pointer)
    if (kind && kind !== 'object') throw new Error('Expected an object at ' + here.pointer)
    const properties = new Map<string, Property>()
    const required = new Set<string>()

    if (schema.properties !== undefined && !isObject(schema.properties)) {
      throw new Error('properties must be an object at ' + here.pointer)
    }
    if (schema.required !== undefined && (!Array.isArray(schema.required)
      || !schema.required.every((v: unknown) => typeof v === 'string'))) {
      throw new Error('required must be an array of strings at ' + here.pointer)
    }
    for (const value of schema.required as string[] || []) required.add(value)

    if (isObject(schema.properties)) {
      for (const [property, child] of Object.entries(schema.properties)) {
        if (typeof child !== 'boolean' && !isObject(child)) {
          throw new Error('Invalid property schema at ' + here.pointer + '/properties/' + property)
        }
        properties.set(property, {
          schema: child,
          location: resolver.child(here, ['properties', property], child),
        })
      }
    }

    if (schema.allOf !== undefined) {
      if (!Array.isArray(schema.allOf)) throw new Error('allOf must be an array at ' + here.pointer)
      for (const [index, part] of schema.allOf.entries()) {
        if (typeof part !== 'boolean' && !isObject(part)) throw new Error('Invalid allOf branch.')
        const merged = objectShape(resolver.child(here, ['allOf', String(index)], part), next)
        for (const requiredName of merged.required) required.add(requiredName)
        for (const [name, property] of merged.properties) {
          const previous = properties.get(name)
          if (previous && JSON.stringify(previous.schema) !== JSON.stringify(property.schema)) {
            throw new Error('Conflicting allOf property "' + name + '" at ' + here.pointer)
          }
          if (!previous) properties.set(name, property)
        }
      }
    }
    if (schema.additionalProperties === false && Array.isArray(schema.allOf)) {
      warnings.push({
        severity: 'warning', path: here.pointer,
        message: 'allOf and additionalProperties:false may constrain other branches; generated classes do not enforce validation.',
      })
    }
    return { properties, required }
  }

  function enumType(location: SchemaLocation, preferred: string, values: string[]): string {
    const key = resolver.identity(location)
    const existing = known.get(key)
    if (existing) return existing
    const schema = asObject(location.schema)
    const name = nameFor(optionalString(schema, 'title') || preferred)
    known.set(key, name)
    const constants: EnumConstant[] = []
    const constantNames = new Set<string>()
    for (const value of values) {
      let constant = words(value).map((part) => part.toUpperCase()).join('_') || 'EMPTY'
      if (!/^[A-Za-z_$]/.test(constant)) constant = 'VALUE_' + constant
      if (RESERVED.has(constant.toLowerCase())) constant += '_VALUE'
      const initial = constant
      for (let number = 2; constantNames.has(constant); number++) constant = initial + '_' + number
      constantNames.add(constant)
      constants.push({ name: constant, value })
    }
    models.push({
      kind: 'enum', name, fields: [], constants,
      description: optionalString(schema, 'description') || '',
    })
    return name
  }

  function javaType(location: SchemaLocation, preferred: string): string {
    const here = resolve(location)
    if (here.schema === false) throw new Error('Unsatisfiable false schema at ' + here.pointer)
    if (here.schema === true) return 'Object'
    const schema = here.schema
    assertNoUnsupportedAlternatives(schema, here.pointer)
    const kind = typeOfSchema(schema, here.pointer)
    if (Array.isArray(schema.enum)) {
      if (new Set(schema.enum.map((v) => JSON.stringify(v))).size !== schema.enum.length) {
        throw new Error('Duplicate enum value at ' + here.pointer)
      }
      if (schema.enum.length > 0 && schema.enum.every((v) => typeof v === 'string')
          && (!kind || kind === 'string')) {
        return enumType(here, preferred, schema.enum as string[])
      }
      warnings.push({
        severity: 'warning', path: here.pointer,
        message: 'Non-string enum is represented by its Java scalar type; enum constraints are not enforced.',
      })
    }
    switch (kind) {
      case 'string':
        switch (schema.format) {
          case 'date': return 'LocalDate'
          case 'date-time': return 'OffsetDateTime'
          case 'uuid': return 'UUID'
          case 'uri': return 'URI'
          default: return 'String'
        }
      case 'integer': return 'Long'
      case 'number': return 'BigDecimal'
      case 'boolean': return 'Boolean'
      case 'array': {
        const child = schema.items
        if (child === undefined) return 'List<Object>'
        if (typeof child !== 'boolean' && !isObject(child)) throw new Error('Invalid items schema at ' + here.pointer)
        const itemName = preferred.endsWith('s') && preferred.length > 1
          ? preferred.slice(0, -1) : preferred + 'Item'
        return 'List<' + javaType(resolver.child(here, ['items'], child), itemName) + '>'
      }
      case 'object': {
        if (schema.properties !== undefined || schema.allOf !== undefined
          || schema.additionalProperties === false) return objectType(here, preferred)
        if (schema.additionalProperties === undefined || schema.additionalProperties === true) {
          return 'Map<String, Object>'
        }
        if (isObject(schema.additionalProperties)) {
          return 'Map<String, ' + javaType(
            resolver.child(here, ['additionalProperties'], schema.additionalProperties),
            preferred + 'Value') + '>'
        }
        throw new Error('Invalid additionalProperties at ' + here.pointer)
      }
      case 'null': return 'Object'
      case undefined:
        warnings.push({
          severity: 'warning', path: here.pointer,
          message: 'Unspecified JSON Schema type is generated as Object.',
        })
        return 'Object'
      default: throw new Error('Unsupported JSON Schema type "' + kind + '" at ' + here.pointer)
    }
  }

  function objectType(location: SchemaLocation, preferred: string, forceName = false): string {
    const here = resolve(location)
    const key = resolver.identity(here)
    const existing = known.get(key)
    if (existing) return existing
    const schema = asObject(here.schema)
    const refName = here.pointer.includes('/$defs/')
      ? decodeURIComponent(here.pointer.split('/').pop() || '') : preferred
    const name = nameFor(forceName ? preferred : optionalString(schema, 'title') || refName)
    known.set(key, name)
    const model: JavaModel = {
      kind: 'class', name, fields: [], constants: [],
      description: optionalString(schema, 'description') || '',
    }
    models.push(model) // Register first: recursive properties may point to this class.

    const shape = objectShape(here)
    const usedFieldNames = new Set<string>()
    for (const [jsonName, property] of shape.properties) {
      const resolved = resolve(property.location)
      const propertySchema = isObject(resolved.schema) ? resolved.schema : {}
      const baseName = fieldName(jsonName)
      let memberName = baseName
      for (let number = 2; usedFieldNames.has(memberName); number++) memberName = baseName + number
      usedFieldNames.add(memberName)
      const fieldPath = property.location.pointer
      const override = options.fieldTypes[fieldPath]
      if (override && !FIELD_OVERRIDES.has(override)) {
        throw new Error('Unsupported Java type override at ' + fieldPath + ': ' + override)
      }
      model.fields.push({
        name: memberName, jsonName,
        type: override || javaType(property.location,
          (isObject(property.schema) && (property.schema.type === 'array' || property.schema.items !== undefined)
            ? name + className(jsonName) : className(jsonName))),
        required: shape.required.has(jsonName),
        nullable: nullable(propertySchema),
        schema: propertySchema,
        pointer: fieldPath,
      })
    }

    if (schema.additionalProperties !== undefined && schema.additionalProperties !== false
      && options.model === 'pojo' && shape.properties.size > 0) {
      warnings.push({
        severity: 'warning', path: here.pointer,
        message: 'Additional dynamic properties are not stored by the generated POJO. Choose JOJO if unknown members must be retained.',
      })
    }
    return name
  }

  const root = resolve(resolver.root)
  const rootSchema = asObject(root.schema)
  const kind = typeOfSchema(rootSchema, root.pointer)
  if (kind !== 'object') throw new Error('Root schema must describe an object.')
  const desiredName = options.className.trim() || optionalString(rootSchema, 'title') || 'GeneratedType'
  objectType(root, desiredName, Boolean(options.className.trim()))
  return { models, diagnostics: warnings }
}
