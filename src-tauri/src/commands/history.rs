use tauri::State;
use serde::Serialize;
use crate::mcp::ConnectionMap;

#[derive(Serialize)]
pub struct HistoryEntry {
    id: String,
    #[serde(rename = "serverId")]
    server_id: String,
    #[serde(rename = "toolName")]
    tool_name: String,
    params: serde_json::Value,
    result: Option<serde_json::Value>,
    #[serde(rename = "durationMs")]
    duration_ms: i64,
    error: Option<String>,
    #[serde(rename = "calledAt")]
    called_at: i64,
}

/// Returns call history for a server (or all servers if server_id is None).
/// Currently returns empty list — SQLite query will be wired in Phase 2
/// once tauri-plugin-sql v2 Database managed-state API is confirmed.
#[tauri::command]
pub async fn list_history(
    server_id: Option<String>,
    limit: Option<i64>,
    _connections: State<'_, ConnectionMap>,
) -> Result<Vec<HistoryEntry>, String> {
    let _limit = limit.unwrap_or(50);
    let _server_id = server_id;
    // TODO(phase2): query SQLite history table
    Ok(vec![])
}
