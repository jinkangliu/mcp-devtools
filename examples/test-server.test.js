const { spawn } = require('child_process')
const path = require('path')

function runTest() {
  const proc = spawn('node', [path.join(__dirname, 'test-server.js')])
  const responses = []
  let buffer = ''

  proc.stdout.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (line.trim()) responses.push(JSON.parse(line))
    }
  })

  function send(obj) { proc.stdin.write(JSON.stringify(obj) + '\n') }

  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0.1' } } })
  send({ jsonrpc: '2.0', method: 'notifications/initialized' })
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'echo', arguments: { message: 'hello' } } })
  send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'add', arguments: { a: 3, b: 4 } } })

  setTimeout(() => {
    proc.kill()
    let passed = 0, failed = 0
    function assert(ok, msg) { ok ? (console.log('  ✓', msg), passed++) : (console.error('  ✗', msg), failed++) }

    console.log('\nMCP Test Server Integration Tests\n==================================')
    const ir = responses.find(r => r.id === 1)
    assert(ir?.result?.protocolVersion === '2024-11-05', 'initialize returns protocolVersion')
    const lr = responses.find(r => r.id === 2)
    assert(Array.isArray(lr?.result?.tools), 'tools/list returns array')
    assert(lr?.result?.tools?.length === 2, 'tools/list returns 2 tools')
    assert(lr?.result?.tools?.some(t => t.name === 'echo'), 'echo tool present')
    assert(lr?.result?.tools?.some(t => t.name === 'add'), 'add tool present')
    const er = responses.find(r => r.id === 3)
    assert(er?.result?.content?.[0]?.text === 'hello', 'echo returns message')
    const ar = responses.find(r => r.id === 4)
    assert(ar?.result?.content?.[0]?.text === '7', 'add returns sum')
    console.log(`\n${passed} passed, ${failed} failed`)
    process.exit(failed > 0 ? 1 : 0)
  }, 500)
}

runTest()
