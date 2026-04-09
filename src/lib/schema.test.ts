import { describe, it, expect } from 'vitest'
import { schemaToFields, fieldsToParams } from './schema'
import { JsonSchema } from '../types'

describe('schemaToFields', () => {
  it('returns empty array for schema with no properties', () => {
    const schema: JsonSchema = { type: 'object' }
    expect(schemaToFields(schema)).toEqual([])
  })

  it('marks required fields correctly', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        encoding: { type: 'string' },
      },
      required: ['path'],
    }
    const fields = schemaToFields(schema)
    expect(fields.find((f) => f.key === 'path')?.required).toBe(true)
    expect(fields.find((f) => f.key === 'encoding')?.required).toBe(false)
  })

  it('includes enum values', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['read', 'write'] },
      },
    }
    const fields = schemaToFields(schema)
    expect(fields[0].enum).toEqual(['read', 'write'])
  })
})

describe('fieldsToParams', () => {
  it('converts number strings to numbers', () => {
    const fields = [{ key: 'count', type: 'number' as const, required: false }]
    expect(fieldsToParams(fields, { count: '42' })).toEqual({ count: 42 })
  })

  it('skips empty values', () => {
    const fields = [{ key: 'path', type: 'string' as const, required: false }]
    expect(fieldsToParams(fields, { path: '' })).toEqual({})
  })

  it('parses JSON for object fields', () => {
    const fields = [
      { key: 'opts', type: 'object' as const, required: false },
    ]
    expect(fieldsToParams(fields, { opts: '{"a":1}' })).toEqual({
      opts: { a: 1 },
    })
  })
})
