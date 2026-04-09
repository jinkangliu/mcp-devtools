#!/usr/bin/env node
const readline = require('readline')
const rl = readline.createInterface({ input: process.stdin })

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

const tools = [
  {
    name: 'echo',
    description: 'Returns the input message back',
    inputSchema: { type: 'object', properties: { message: { type: 'string', description: 'The message to echo' } }, required: ['message'] },
  },
  {
    name: 'add',
    description: 'Adds two numbers',
    inputSchema: { type: 'object', properties: { a: { type: 'number', description: 'First number' }, b: { type: 'number', description: 'Second number' } }, required: ['a', 'b'] },
  },
]

rl.on('line', (line) => {
  const msg = JSON.parse(line.trim())
  if (msg.method === 'initialize') {
    send({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: {}, serverInfo: { name: 'test-server', version: '0.1.0' } } })
  } else if (msg.method === 'notifications/initialized') {
    // no response for notifications
  } else if (msg.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: msg.id, result: { tools } })
  } else if (msg.method === 'tools/call') {
    const { name, arguments: args } = msg.params
    if (name === 'echo') {
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: args.message }] } })
    } else if (name === 'add') {
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: String(args.a + args.b) }] } })
    }
  }
})
