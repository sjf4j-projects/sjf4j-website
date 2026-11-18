import { buildModel } from './model.ts'
import { renderJavaFiles } from './java.ts'
import { SchemaResolver } from './schema.ts'
import type { GeneratorOptions, GeneratorResult } from './types.ts'

export { DEFAULT_OPTIONS } from './types.ts'
export type { Diagnostic, GeneratedFile, GeneratorOptions, GeneratorResult } from './types.ts'

export function generateJava(
  mainSchema: string,
  options: GeneratorOptions,
  librarySchemas: string[] = [],
): GeneratorResult {
  try {
    const resolver = new SchemaResolver(mainSchema, librarySchemas)
    const result = buildModel(resolver, options)
    return {
      files: renderJavaFiles(result.models, options),
      diagnostics: result.diagnostics,
    }
  } catch (error) {
    return {
      files: [],
      diagnostics: [{
        severity: 'error',
        path: '#',
        message: error instanceof Error ? error.message : 'Unable to generate Java.',
      }],
    }
  }
}
