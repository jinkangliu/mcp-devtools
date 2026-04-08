export interface McpTool {
  name: string;
  description?: string;
  inputSchema: JsonSchema;
}

export interface JsonSchema {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  description?: string;
  enum?: string[];
  default?: unknown;
}

export interface Server {
  id: string;
  name: string;
  transport: 'stdio' | 'http-sse';
  config: StdioConfig | HttpSseConfig;
  tools: McpTool[];
  connected: boolean;
}

export interface StdioConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface HttpSseConfig {
  url: string;
  headers?: Record<string, string>;
}

export interface HistoryEntry {
  id: string;
  serverId: string;
  toolName: string;
  params: unknown;
  result: unknown;
  durationMs: number;
  error: string | null;
  calledAt: number;
}

export interface CallResult {
  result: unknown;
  durationMs: number;
  error: string | null;
}
