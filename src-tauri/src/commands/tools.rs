use tauri::State;
use serde::{Deserialize, Serialize};
use std::time::Instant;
use crate::mcp::{ConnectionMap, TransportHandle};

#[derive(Deserialize)]
pub struct CallToolArgs {
    #[serde(rename = "serverId")]
    server_id: String,
    #[serde(rename = "toolName")]
    tool_name: String,
    params: serde_json::Value,
}

#[derive(Serialize)]
pub struct CallToolResult {
    result: Option<serde_json::Value>,
    #[serde(rename = "durationMs")]
    duration_ms: u64,
    error: Option<String>,
}

#[tauri::command]
pub async fn mcp_call_tool(
    args: CallToolArgs,
    connections: State<'_, ConnectionMap>,
) -> Result<CallToolResult, String> {
    let start = Instant::now();
    let mut map = connections.lock().unwrap();
    let conn = map.get_mut(&args.server_id)
        .ok_or("server not found")?;

    match &mut conn.transport {
        TransportHandle::Stdio(handle) => {
            match handle.call_tool(&args.tool_name, args.params) {
                Ok(result) => Ok(CallToolResult {
                    result: Some(result),
                    duration_ms: start.elapsed().as_millis() as u64,
                    error: None,
                }),
                Err(e) => Ok(CallToolResult {
                    result: None,
                    duration_ms: start.elapsed().as_millis() as u64,
                    error: Some(e.to_string()),
                }),
            }
        }
    }
}
