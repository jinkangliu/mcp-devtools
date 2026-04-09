use std::process::{Child, ChildStdin, ChildStdout};
use std::io::{BufReader, BufWriter, Write, BufRead};
use serde_json::{json, Value};
use anyhow::{Result, anyhow};

pub struct StdioHandle {
    process: Child,
    stdin: BufWriter<ChildStdin>,
    stdout: BufReader<ChildStdout>,
    next_id: u64,
}

impl StdioHandle {
    pub fn spawn(command: &str, args: &[String]) -> Result<Self> {
        use std::process::{Command, Stdio};
        let mut child = Command::new(command)
            .args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| anyhow!("Failed to spawn '{}': {}", command, e))?;

        let stdin = BufWriter::new(child.stdin.take().unwrap());
        let stdout = BufReader::new(child.stdout.take().unwrap());

        Ok(Self { process: child, stdin, stdout, next_id: 1 })
    }

    fn send_request(&mut self, method: &str, params: Value) -> Result<Value> {
        let id = self.next_id;
        self.next_id += 1;

        let request = json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        });

        let mut line = serde_json::to_string(&request)?;
        line.push('\n');
        self.stdin.write_all(line.as_bytes())?;
        self.stdin.flush()?;

        let mut response_line = String::new();
        self.stdout.read_line(&mut response_line)?;
        let response: Value = serde_json::from_str(response_line.trim())?;

        if let Some(error) = response.get("error") {
            return Err(anyhow!("MCP error: {}", error));
        }

        Ok(response["result"].clone())
    }

    pub fn initialize(&mut self) -> Result<Vec<super::McpTool>> {
        // Send initialize
        self.send_request("initialize", json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": { "name": "mcp-devtools", "version": "0.1.0" }
        }))?;

        // Send initialized notification (no response expected)
        let notif = json!({
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        });
        let mut line = serde_json::to_string(&notif)?;
        line.push('\n');
        self.stdin.write_all(line.as_bytes())?;
        self.stdin.flush()?;

        // List tools
        let result = self.send_request("tools/list", json!({}))?;
        let tools: Vec<super::McpTool> = serde_json::from_value(
            result["tools"].clone()
        )?;
        Ok(tools)
    }

    pub fn call_tool(&mut self, name: &str, params: Value) -> Result<Value> {
        let result = self.send_request("tools/call", json!({
            "name": name,
            "arguments": params
        }))?;
        Ok(result)
    }
}

impl Drop for StdioHandle {
    fn drop(&mut self) {
        let _ = self.process.kill();
    }
}
