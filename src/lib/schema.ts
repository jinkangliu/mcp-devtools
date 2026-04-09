import { JsonSchema } from '../types'

export interface FormField {
  key: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  required: boolean
  enum?: string[]
  default?: unknown
}

export function schemaToFields(schema: JsonSchema): FormField[] {
  if (!schema.properties) return []
  const required = schema.required ?? []
  return Object.entries(schema.properties).map(([key, prop]) => ({
    key,
    type: prop.type as FormField['type'],
    description: prop.description,
    required: required.includes(key),
    enum: prop.enum,
    default: prop.default,
  }))
}

export function fieldsToParams(
  fields: FormField[],
  values: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    const raw = values[field.key]
    if (raw === undefined || raw === '') continue
    if (field.type === 'number') {
      result[field.key] = Number(raw)
    } else if (field.type === 'boolean') {
      result[field.key] = raw === 'true'
    } else if (field.type === 'object' || field.type === 'array') {
      try {
        result[field.key] = JSON.parse(raw)
      } catch {
        result[field.key] = raw
      }
    } else {
      result[field.key] = raw
    }
  }
  return result
}
