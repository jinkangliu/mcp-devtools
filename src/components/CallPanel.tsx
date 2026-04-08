import { Server, McpTool } from '../types'

interface CallPanelProps {
  server: Server
  tool: McpTool
}

export function CallPanel(_props: CallPanelProps) {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      Call panel coming soon
    </div>
  )
}
