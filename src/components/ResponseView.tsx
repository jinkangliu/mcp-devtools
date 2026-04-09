import { CallResult } from '../types'
import { Badge } from '@/components/ui/badge'

interface ResponseViewProps {
  result: CallResult | null
  loading: boolean
}

export function ResponseView({ result, loading }: ResponseViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Calling tool...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Hit Send to call this tool
      </div>
    )
  }

  const isError = !!result.error

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={isError ? 'destructive' : 'default'}>
          {isError ? 'Error' : 'Success'}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {result.durationMs}ms
        </span>
      </div>
      <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64 font-mono whitespace-pre-wrap">
        {isError
          ? result.error
          : JSON.stringify(result.result, null, 2)}
      </pre>
    </div>
  )
}
