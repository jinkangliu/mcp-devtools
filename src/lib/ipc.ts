import { invoke } from '@tauri-apps/api/core'
import {
  StdioConfig,
  HttpSseConfig,
  McpTool,
  HistoryEntry,
  CallResult,
} from '../types'

export interface ConnectServerArgs {
  name: string
  transport: 'stdio' | 'http-sse'
  config: StdioConfig | HttpSseConfig
}

export interface ConnectServerResult {
  serverId: string
  tools: McpTool[]
}

export async function connectServer(
  args: ConnectServerArgs
): Promise<ConnectServerResult> {
  return invoke('connect_server', { args })
}

export async function disconnectServer(serverId: string): Promise<void> {
  return invoke('disconnect_server', { serverId })
}

export interface CallToolArgs {
  serverId: string
  toolName: string
  params: Record<string, unknown>
}

export async function callTool(args: CallToolArgs): Promise<CallResult> {
  return invoke('mcp_call_tool', { args })
}

export async function listHistory(
  serverId?: string,
  limit = 50
): Promise<HistoryEntry[]> {
  return invoke('list_history', { serverId: serverId ?? null, limit })
}
