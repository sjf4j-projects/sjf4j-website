import type { SchemaLocation, SchemaNode, SchemaObject } from './types'

const INTERNAL_BASE = 'https://schema-generator.sjf4j.invalid/'

export function isObject(value: unknown): value is SchemaObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function asObject(value: SchemaNode): SchemaObject {
  if (!isObject(value)) throw new Error('A boolean schema cannot be represented as a Java model.')
  return value
}

export function optionalString(node: SchemaObject, key: string): string | undefined {
  return typeof node[key] === 'string' ? node[key] as string : undefined
}

function parseDocument(text: string, label: string): SchemaNode {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw new Error(label + ': ' + (error instanceof Error ? error.message : 'Invalid JSON.'))
  }
  if (!isObject(parsed)) throw new Error(label + ': the top-level schema must be a JSON object.')
  return parsed
}

function documentId(schema: SchemaNode, base: string, fallback: string): string {
  const id = isObject(schema) ? optionalString(schema, '$id') : undefined
  try {
    return new URL(id || fallback, base).href.split('#')[0]
  } catch {
    throw new Error('Invalid schema $id: ' + String(id))
  }
}

function decodePointer(fragment: string): string[] {
  if (!fragment) return []
  let decoded: string
  try {
    decoded = decodeURIComponent(fragment)
  } catch {
    throw new Error('Invalid percent-encoding in $ref fragment: ' + fragment)
  }
  if (!decoded.startsWith('/')) {
    throw new Error('Only JSON Pointer $ref fragments are supported: #' + fragment)
  }
  return decoded.slice(1).split('/').map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
}

function resolvePointer(root: SchemaNode, fragment: string): SchemaNode {
  let value: unknown = root
  for (const part of decodePointer(fragment)) {
    if ((!isObject(value) && !Array.isArray(value)) || !(part in value)) {
      throw new Error('Unresolved JSON Pointer: #' + fragment)
    }
    value = (value as Record<string, unknown>)[part]
  }
  if (typeof value !== 'boolean' && !isObject(value)) {
    throw new Error('The $ref target is not a JSON Schema: #' + fragment)
  }
  return value
}

/**
 * Resolve local and explicitly supplied external documents; never fetch from the network.
 * Relative library $id values are resolved against the main document's directory.
 */
export class SchemaResolver {
  private readonly documents = new Map<string, SchemaNode>()
  readonly root: SchemaLocation

  constructor(mainText: string, libraryTexts: string[] = []) {
    const main = parseDocument(mainText, 'Main schema')
    const mainId = documentId(main, INTERNAL_BASE, 'main.json')
    this.root = { schema: main, documentId: mainId, pointer: '#' }
    this.documents.set(mainId, main)

    const libraryBase = new URL('.', mainId).href
    for (let index = 0; index < libraryTexts.length; index++) {
      const library = parseDocument(libraryTexts[index], 'Schema library ' + (index + 1))
      const id = isObject(library) ? optionalString(library, '$id') : undefined
      if (!id) throw new Error('Schema library ' + (index + 1) + ' must declare $id.')
      const uri = documentId(library, libraryBase, 'library-' + index + '.json')
      if (this.documents.has(uri)) throw new Error('Duplicate schema document $id: ' + uri)
      this.documents.set(uri, library)
    }
  }

  follow(location: SchemaLocation): SchemaLocation {
    let current = location
    const seen = new Set<string>()
    for (let depth = 0; depth < 128; depth++) {
      if (!isObject(current.schema) || typeof current.schema.$ref !== 'string') return current
      const schema = current.schema
      for (const key of Object.keys(schema)) {
        if (!['$ref', '$id', 'title', 'description', '$comment'].includes(key)) {
          throw new Error('Unsupported $ref sibling keyword "' + key + '" at ' + current.pointer)
        }
      }

      let target: URL
      try {
        target = new URL(schema.$ref, current.documentId)
      } catch {
        throw new Error('Invalid $ref at ' + current.pointer + ': ' + schema.$ref)
      }
      const fragment = target.hash.slice(1)
      target.hash = ''
      const id = target.href
      const key = id + '#' + fragment
      if (seen.has(key)) throw new Error('Cyclic $ref alias at ' + current.pointer)
      seen.add(key)
      const document = this.documents.get(id)
      if (!document) throw new Error('Unresolved external $ref: ' + schema.$ref + ' (add it to Schema Libraries)')
      const resolved = resolvePointer(document, fragment)
      current = { schema: resolved, documentId: id, pointer: '#' + fragment }
    }
    throw new Error('Too many chained $ref references.')
  }

  child(parent: SchemaLocation, segments: string[], schema: SchemaNode): SchemaLocation {
    const pointer = parent.pointer + segments.map((part) =>
      '/' + part.replace(/~/g, '~0').replace(/\//g, '~1')).join('')
    return { schema, documentId: parent.documentId, pointer }
  }

  identity(location: SchemaLocation): string {
    return location.documentId + location.pointer
  }
}
