import { useState, useCallback } from 'react'
import { Server } from '../types'
import { connectServer, disconnectServer, ConnectServerArgs } from '../lib/ipc'

export function useServers() {
  const [servers, setServers] = useState<Server[]>([])

  const connect = useCallback(async (args: ConnectServerArgs) => {
    const { serverId, tools } = await connectServer(args)
    const server: Server = {
      id: serverId,
      name: args.name,
      transport: args.transport,
      config: args.config,
      tools,
      connected: true,
    }
    setServers((prev) => [...prev, server])
    return server
  }, [])

  const disconnect = useCallback(async (serverId: string) => {
    await disconnectServer(serverId)
    setServers((prev) => prev.filter((s) => s.id !== serverId))
  }, [])

  return { servers, connect, disconnect }
}
