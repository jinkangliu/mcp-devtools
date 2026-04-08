import React from 'react'
import { Server, McpTool } from '../types'

interface ServerTreeProps {
  servers: Server[]
  setServers: React.Dispatch<React.SetStateAction<Server[]>>
  selectedServer: Server | null
  selectedTool: McpTool | null
  onSelectTool: (server: Server, tool: McpTool) => void
}

export function ServerTree(_props: ServerTreeProps) {
  return (
    <aside className="w-64 border-r border-border overflow-y-auto">
      <div className="p-4 text-sm text-muted-foreground">No servers connected</div>
    </aside>
  )
}
