import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FormEditor } from './FormEditor'
import { JsonEditor } from './JsonEditor'
import { ResponseView } from './ResponseView'
import { Server, McpTool, CallResult } from '../types'
import { schemaToFields, fieldsToParams } from '../lib/schema'
import { callTool } from '../lib/ipc'
import { Play } from 'lucide-react'

interface CallPanelProps {
  server: Server
  tool: McpTool
}

export function CallPanel({ server, tool }: CallPanelProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [jsonValue, setJsonValue] = useState('{}')
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form')
  const [result, setResult] = useState<CallResult | null>(null)
  const [loading, setLoading] = useState(false)

  const fields = schemaToFields(tool.inputSchema)

  function syncFormToJson(values: Record<string, string>) {
    setFormValues(values)
    const params = fieldsToParams(fields, values)
    setJsonValue(JSON.stringify(params, null, 2))
  }

  function syncJsonToForm(raw: string) {
    setJsonValue(raw)
    try {
      const parsed = JSON.parse(raw)
      const newValues: Record<string, string> = {}
      for (const field of fields) {
        if (parsed[field.key] !== undefined) {
          newValues[field.key] = String(parsed[field.key])
        }
      }
      setFormValues(newValues)
    } catch {
      // invalid JSON — keep form as-is
    }
  }

  async function handleSend() {
    setLoading(true)
    setResult(null)
    try {
      let params: Record<string, unknown>
      if (activeTab === 'form') {
        params = fieldsToParams(fields, formValues)
      } else {
        params = JSON.parse(jsonValue)
      }
      const res = await callTool({
        serverId: server.id,
        toolName: tool.name,
        params,
      })
      setResult(res)
    } catch (e) {
      setResult({ result: null, durationMs: 0, error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{tool.name}</h2>
          {tool.description && (
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          )}
        </div>
        <Button onClick={handleSend} disabled={loading} className="gap-2">
          <Play className="h-4 w-4" />
          Send
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'form' | 'json')}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="flex-1 overflow-auto">
          <FormEditor
            fields={fields}
            values={formValues}
            onChange={syncFormToJson}
          />
        </TabsContent>

        <TabsContent value="json" className="flex-1">
          <JsonEditor
            value={jsonValue}
            onChange={syncJsonToForm}
            schema={tool.inputSchema}
          />
        </TabsContent>
      </Tabs>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Response</h3>
        <ResponseView result={result} loading={loading} />
      </div>
    </div>
  )
}
