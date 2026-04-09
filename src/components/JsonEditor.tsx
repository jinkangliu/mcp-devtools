import Editor, { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { JsonSchema } from '../types'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  schema?: JsonSchema
}

export function JsonEditor({ value, onChange, schema }: JsonEditorProps) {
  function handleMount(_editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    if (schema) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'mcp://tool-params',
            fileMatch: ['*'],
            schema: schema as object,
          },
        ],
      })
    }
  }

  return (
    <Editor
      height="200px"
      defaultLanguage="json"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        lineNumbers: 'off',
        scrollBeyondLastLine: false,
        fontSize: 13,
        tabSize: 2,
      }}
      theme="vs-dark"
    />
  )
}
