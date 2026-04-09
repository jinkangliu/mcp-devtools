import { useState, useCallback } from 'react'
import { HistoryEntry } from '../types'
import { listHistory } from '../lib/ipc'

export function useHistory(serverId?: string) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listHistory(serverId, 50)
      setEntries(data)
    } catch (e) {
      console.error('Failed to load history', e)
    } finally {
      setLoading(false)
    }
  }, [serverId])

  return { entries, loading, refresh }
}
