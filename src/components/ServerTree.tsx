import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Plus, Unplug } from 'lucide-react'
import { Server, McpTool } from '../types'
import { useServers } from '../hooks/useServers'
import { ConnectDialog } from './ConnectDialog'
import { ConnectServerArgs } from '../lib/ipc'

interface ServerTreeProps {
  servers: Server[]
  setServers: React.Dispatch<React.SetStateAction<Server[]>>
  selectedServer: Server | null
  selectedTool: McpTool | null
  onSelectTool: (server: Server, tool: McpTool) => void
}

export function ServerTree({
  servers,
  setServers,
  selectedServer,
  selectedTool,
  onSelectTool,
}: ServerTreeProps) {
  const { connect, disconnect } = useServers()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showConnect, setShowConnect] = useState(false)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConnect(args: ConnectServerArgs) {
    const server = await connect(args)
    setServers((prev) => [...prev, server])
    setExpanded((prev) => new Set(prev).add(server.id))
    setShowConnect(false)
  }

  async function handleDisconnect(serverId: string) {
    await disconnect(serverId)
    setServers((prev) => prev.filter((s) => s.id !== serverId))
  }

  return (
    <div className="w-64 border-r flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-semibold">MCP Servers</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setShowConnect(true)}
          title="Connect to MCP Server"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {servers.length === 0 && (
          <p className="text-xs text-muted-foreground p-3">
            No servers connected. Click + to add one.
          </p>
        )}
        {servers.map((server) => (
          <div key={server.id}>
            <div
              className="flex items-center gap-1 px-2 py-1.5 hover:bg-accent cursor-pointer group"
              onClick={() => toggleExpand(server.id)}
            >
              {expanded.has(server.id) ? (
                <ChevronDown className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0" />
              )}
              <span className="text-sm flex-1 truncate">{server.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDisconnect(server.id)
                }}
                title="Disconnect"
              >
                <Unplug className="h-3 w-3" />
              </Button>
            </div>

            {expanded.has(server.id) &&
              server.tools.map((tool) => (
                <div
                  key={tool.name}
                  className={`pl-8 pr-2 py-1 text-sm cursor-pointer hover:bg-accent truncate ${
                    selectedServer?.id === server.id &&
                    selectedTool?.name === tool.name
                      ? 'bg-accent font-medium'
                      : ''
                  }`}
                  onClick={() => onSelectTool(server, tool)}
                  title={tool.description}
                >
                  {tool.name}
                </div>
              ))}
          </div>
        ))}
      </ScrollArea>

      {showConnect && (
        <ConnectDialog
          onConnect={handleConnect}
          onClose={() => setShowConnect(false)}
        />
      )}
    </div>
  )
}
