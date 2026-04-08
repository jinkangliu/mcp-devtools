import { useState } from 'react'
import { ServerTree } from './components/ServerTree'
import { CallPanel } from './components/CallPanel'
import { Server, McpTool } from './types'

export default function App() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <ServerTree
        servers={servers}
        setServers={setServers}
        selectedServer={selectedServer}
        selectedTool={selectedTool}
        onSelectTool={(server, tool) => {
          setSelectedServer(server)
          setSelectedTool(tool)
        }}
      />
      <div className="flex-1 overflow-hidden">
        {selectedServer && selectedTool ? (
          <CallPanel server={selectedServer} tool={selectedTool} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a tool from the left panel to get started
          </div>
        )}
      </div>
    </div>
  )
}
