use tauri::State;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::mcp::{ConnectionMap, McpConnection, McpTool, TransportHandle};
use crate::mcp::stdio::StdioHandle;

#[derive(Deserialize)]
pub struct ConnectArgs {
    name: String,
    transport: String,
    config: serde_json::Value,
}

#[derive(Serialize)]
pub struct ConnectResult {
    #[serde(rename = "serverId")]
    server_id: String,
    tools: Vec<McpTool>,
}

#[tauri::command]
pub async fn connect_server(
    args: ConnectArgs,
    connections: State<'_, ConnectionMap>,
) -> Result<ConnectResult, String> {
    match args.transport.as_str() {
        "stdio" => {
            let command = args.config["command"]
                .as_str()
                .ok_or("missing command")?
                .to_string();
            let cmd_args: Vec<String> = args.config["args"]
                .as_array()
                .unwrap_or(&vec![])
                .iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect();

            let mut handle = StdioHandle::spawn(&command, &cmd_args)
                .map_err(|e| e.to_string())?;

            let tools = handle.initialize().map_err(|e| e.to_string())?;

            let server_id = Uuid::new_v4().to_string();
            let mut map = connections.lock().unwrap();
            map.insert(server_id.clone(), McpConnection {
                tools: tools.clone(),
                transport: TransportHandle::Stdio(handle),
            });

            Ok(ConnectResult { server_id, tools })
        }
        _ => Err(format!("unsupported transport: {}", args.transport)),
    }
}

#[tauri::command]
pub async fn disconnect_server(
    server_id: String,
    connections: State<'_, ConnectionMap>,
) -> Result<(), String> {
    let mut map = connections.lock().unwrap();
    map.remove(&server_id);
    Ok(())
}
