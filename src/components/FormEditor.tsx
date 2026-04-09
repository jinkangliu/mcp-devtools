import { FormField } from '../lib/schema'
import { Badge } from '@/components/ui/badge'

interface FormEditorProps {
  fields: FormField[]
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
}

export function FormEditor({ fields, values, onChange }: FormEditorProps) {
  function set(key: string, value: string) {
    onChange({ ...values, [key]: value })
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This tool takes no parameters.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{field.key}</label>
            {field.required && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                required
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {field.type}
            </Badge>
          </div>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          {field.enum ? (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
            >
              <option value="">-- select --</option>
              {field.enum.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : field.type === 'boolean' ? (
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
            >
              <option value="">-- select --</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : field.type === 'object' || field.type === 'array' ? (
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[80px]"
              placeholder={`JSON ${field.type}`}
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
            />
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={
                field.default !== undefined ? String(field.default) : ''
              }
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
