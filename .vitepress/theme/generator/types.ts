/** Browser-only Schema-to-Java generator contracts. */
export type SchemaObject = Record<string, unknown>
export type SchemaNode = SchemaObject | boolean

export type Diagnostic = {
  severity: 'error' | 'warning'
  path: string
  message: string
}

export type GeneratorOptions = {
  packageName: string
  className: string
  model: 'pojo' | 'jojo'
  accessors: 'fields' | 'methods' | 'lombok'
  validation: boolean
  validationNamespace: 'jakarta' | 'javax'
  javaDoc: boolean
  fieldTypes: Record<string, string>
}

export type GeneratedFile = {
  path: string
  content: string
}

export type GeneratorResult = {
  files: GeneratedFile[]
  diagnostics: Diagnostic[]
}

export type SchemaLocation = {
  schema: SchemaNode
  documentId: string
  pointer: string
}

export type JavaField = {
  name: string
  jsonName: string
  type: string
  required: boolean
  nullable: boolean
  schema: SchemaObject
  pointer: string
}

export type EnumConstant = {
  name: string
  value: string
}

export type JavaModel = {
  kind: 'class' | 'enum'
  name: string
  description: string
  fields: JavaField[]
  constants: EnumConstant[]
}

export type ModelResult = {
  models: JavaModel[]
  diagnostics: Diagnostic[]
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  packageName: 'org.example.generated',
  className: '',
  model: 'pojo',
  accessors: 'fields',
  validation: false,
  validationNamespace: 'jakarta',
  javaDoc: true,
  fieldTypes: {},
}
