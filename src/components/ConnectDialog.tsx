import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConnectServerArgs } from '../lib/ipc'

interface ConnectDialogProps {
  onConnect: (args: ConnectServerArgs) => Promise<void>
  onClose: () => void
}

export function ConnectDialog({ onConnect, onClose }: ConnectDialogProps) {
  const [name, setName] = useState('')
  const [transport, setTransport] = useState<'stdio' | 'http-sse'>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const connectArgs: ConnectServerArgs =
        transport === 'stdio'
          ? {
              name,
              transport: 'stdio',
              config: {
                command,
                args: args
                  .split(' ')
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            }
          : {
              name,
              transport: 'http-sse',
              config: { url },
            }
      await onConnect(connectArgs)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-background rounded-lg border p-6 w-96 space-y-4"
      >
        <h2 className="text-lg font-semibold">Connect to MCP Server</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="filesystem"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Transport</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={transport}
            onChange={(e) => setTransport(e.target.value as 'stdio' | 'http-sse')}
          >
            <option value="stdio">stdio (local process)</option>
            <option value="http-sse">HTTP + SSE (remote)</option>
          </select>
        </div>

        {transport === 'stdio' ? (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Command</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="npx @modelcontextprotocol/server-filesystem"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Arguments (space-separated)</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                value={args}
                onChange={(e) => setArgs(e.target.value)}
                placeholder="/tmp"
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <label className="text-sm font-medium">Server URL</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:3000/sse"
              required
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </form>
    </div>
  )
}
