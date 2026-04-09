# MCP DevTools

> Postman for MCP — Interactive debugger and tester for MCP Servers.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## What is this?

MCP DevTools lets you connect to any [MCP Server](https://modelcontextprotocol.io), browse its tools, and call them interactively — with an auto-generated form UI or a raw JSON editor.

Think Postman, but for the Model Context Protocol.

## Features

- **Connect** to MCP Servers via stdio (local process) or HTTP+SSE (remote)
- **Browse** all available tools with their descriptions
- **Auto-generated forms** from JSON Schema — no manual JSON typing needed
- **Monaco JSON editor** with schema validation and autocomplete
- **Bidirectional sync** — switch between Form and JSON modes freely
- **Call history** with response time tracking
- **Error classification** — distinguish MCP protocol errors from tool errors

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- Node.js 18+

### Run in development

```bash
npm install
npm run tauri dev
```

### Connect your first server

1. Click **+** in the left panel
2. Choose transport:
   - `stdio` for local servers (most common)
   - `HTTP+SSE` for remote servers
3. Enter the command that starts your MCP Server

**Example — filesystem server:**
```
Command: npx
Arguments: -y @modelcontextprotocol/server-filesystem /tmp
```

**Example — test server (included):**
```
Command: node
Arguments: /absolute/path/to/examples/test-server.js
```
> Use the absolute path to `examples/test-server.js` in your local checkout.

## Roadmap

- **Phase 2** — Test framework: record calls as test cases, run suites in CI
- **Phase 3** — Observability: call timeline visualization, P95 latency tracking

## License

MIT
