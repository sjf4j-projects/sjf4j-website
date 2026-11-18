import type { GeneratedFile, GeneratorOptions, JavaField, JavaModel } from './types.ts'

function javaLiteral(value: string): string {
  return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

function javaDoc(value: string, indent = ''): string[] {
  const sanitized = value.trim().replace(/\*\//g, '* /').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (!sanitized) return []
  const lines = sanitized.split(/\r?\n/)
  return [indent + '/**', ...lines.map((line) => indent + ' * ' + line), indent + ' */']
}

function importsForType(value: string, imports: Set<string>): void {
  if (/\bList</.test(value)) imports.add('java.util.List')
  if (/\bMap</.test(value)) imports.add('java.util.Map')
  if (/\bBigDecimal\b/.test(value)) imports.add('java.math.BigDecimal')
  if (/\bBigInteger\b/.test(value)) imports.add('java.math.BigInteger')
  if (/\bLocalDate\b/.test(value)) imports.add('java.time.LocalDate')
  if (/\bLocalDateTime\b/.test(value)) imports.add('java.time.LocalDateTime')
  if (/\bOffsetDateTime\b/.test(value)) imports.add('java.time.OffsetDateTime')
  if (/\bInstant\b/.test(value)) imports.add('java.time.Instant')
  if (/\bUUID\b/.test(value)) imports.add('java.util.UUID')
  if (/\bURI\b/.test(value)) imports.add('java.net.URI')
  if (/\bJsonObject\b/.test(value)) imports.add('org.sjf4j.JsonObject')
}

function validConstraintNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
}

function emitAnnotations(field: JavaField, opts: GeneratorOptions, imports: Set<string>): string[] {
  const annotations: string[] = []
  if (field.name !== field.jsonName) {
    imports.add('org.sjf4j.annotation.node.NodeProperty')
    annotations.push('@NodeProperty(' + javaLiteral(field.jsonName) + ')')
  }
  if (!opts.validation) return annotations

  const ns = opts.validationNamespace + '.validation.constraints.'
  const typedNonNull = typeof field.schema.type === 'string' && field.schema.type !== 'null'
    || Array.isArray(field.schema.type) && !field.schema.type.includes('null')
    || Array.isArray(field.schema.enum) && !field.schema.enum.includes(null)

  if (field.required && !field.nullable && typedNonNull) {
    imports.add(ns + 'NotNull')
    annotations.push('@NotNull')
  }

  const stringType = field.type === 'String'
  const listType = field.type.startsWith('List<')
  const minimumSize = stringType ? field.schema.minLength : listType ? field.schema.minItems : undefined
  const maximumSize = stringType ? field.schema.maxLength : listType ? field.schema.maxItems : undefined
  const sizeParts: string[] = []
  if (validConstraintNumber(minimumSize) && minimumSize >= 0) sizeParts.push('min = ' + minimumSize)
  if (validConstraintNumber(maximumSize) && maximumSize >= 0) sizeParts.push('max = ' + maximumSize)
  if (sizeParts.length) {
    imports.add(ns + 'Size')
    annotations.push('@Size(' + sizeParts.join(', ') + ')')
  }

  if (stringType && typeof field.schema.pattern === 'string') {
    imports.add(ns + 'Pattern')
    annotations.push('@Pattern(regexp = ' + javaLiteral(field.schema.pattern) + ')')
  }

  if (field.type === 'Long' || field.type === 'Integer') {
    if (validConstraintNumber(field.schema.minimum)) {
      imports.add(ns + 'Min')
      annotations.push('@Min(' + field.schema.minimum + 'L)')
    }
    if (validConstraintNumber(field.schema.maximum)) {
      imports.add(ns + 'Max')
      annotations.push('@Max(' + field.schema.maximum + 'L)')
    }
  }
  return annotations
}

function emitClass(model: JavaModel, opts: GeneratorOptions): { imports: Set<string>; body: string[] } {
  const imports = new Set<string>()
  const lines: string[] = []
  if (opts.model === 'jojo') imports.add('org.sjf4j.JsonObject')
  if (opts.accessors === 'lombok') {
    imports.add('lombok.Getter')
    imports.add('lombok.Setter')
    lines.push('@Getter', '@Setter')
  }
  lines.push('public class ' + model.name + (opts.model === 'jojo' ? ' extends JsonObject' : '') + ' {')

  for (const field of model.fields) {
    importsForType(field.type, imports)
    const annotations = emitAnnotations(field, opts, imports)
    const description = opts.javaDoc && typeof field.schema.description === 'string'
      ? field.schema.description : ''
    if (lines.length > 1 || model.fields.indexOf(field) > 0) lines.push('')
    lines.push(...javaDoc(description, '    '))
    lines.push(...annotations.map((line) => '    ' + line))
    const visibility = opts.accessors === 'fields' ? 'public' : 'private'
    lines.push('    ' + visibility + ' ' + field.type + ' ' + field.name + ';')
  }

  if (opts.accessors === 'methods') {
    for (const field of model.fields) {
      const methodName = field.name.charAt(0).toUpperCase() + field.name.slice(1)
      lines.push(
        '', '    public ' + field.type + ' get' + methodName + '() {',
        '        return ' + field.name + ';', '    }',
        '', '    public void set' + methodName + '(' + field.type + ' value) {',
        '        this.' + field.name + ' = value;', '    }',
      )
    }
  }
  if (model.fields.length) lines.push('')
  lines.push('}')
  return { imports, body: lines }
}

function emitEnum(model: JavaModel): { imports: Set<string>; body: string[] } {
  const imports = new Set([
    'org.sjf4j.annotation.node.NodeValue',
    'org.sjf4j.annotation.node.RawToValue',
    'org.sjf4j.annotation.node.ValueToRaw',
  ])
  const lines: string[] = ['@NodeValue', 'public enum ' + model.name + ' {']
  lines.push(...model.constants.map((constant, index) =>
    '    ' + constant.name + '(' + javaLiteral(constant.value) + ')' +
    (index === model.constants.length - 1 ? ';' : ',')))
  lines.push(
    '', '    private final String raw;',
    '', '    ' + model.name + '(String raw) {',
    '        this.raw = raw;',
    '    }',
    '', '    @ValueToRaw',
    '    public String toRaw() {',
    '        return raw;',
    '    }',
    '', '    @RawToValue',
    '    public static ' + model.name + ' fromRaw(String raw) {',
    '        if (raw == null) return null;',
    '        switch (raw) {',
  )
  lines.push(...model.constants.map((constant) =>
    '            case ' + javaLiteral(constant.value) + ': return ' + constant.name + ';'))
  lines.push(
    '            default: throw new IllegalArgumentException("Unknown ' + model.name + ' value: " + raw);',
    '        }',
    '    }',
    '}',
  )
  return { imports, body: lines }
}

/** Render separate Java source files; no hidden runtime machinery is generated. */
export function renderJavaFiles(models: JavaModel[], opts: GeneratorOptions): GeneratedFile[] {
  const folder = opts.packageName.trim().replace(/\./g, '/')
  return models.map((model) => {
    const rendered = model.kind === 'enum' ? emitEnum(model) : emitClass(model, opts)
    const output: string[] = []
    if (opts.packageName.trim()) output.push('package ' + opts.packageName.trim() + ';', '')
    const imported = Array.from(rendered.imports).sort()
    if (imported.length) {
      output.push(...imported.map((name) => 'import ' + name + ';'), '')
    }
    if (opts.javaDoc && model.description) output.push(...javaDoc(model.description))
    output.push(...rendered.body)
    return {
      path: (folder ? folder + '/' : '') + model.name + '.java',
      content: output.join('\n').trimEnd() + '\n',
    }
  })
}
