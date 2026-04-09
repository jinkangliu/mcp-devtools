pub mod stdio;
pub mod http_sse;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpTool {
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "inputSchema")]
    pub input_schema: serde_json::Value,
}

pub struct McpConnection {
    pub tools: Vec<McpTool>,
    pub transport: TransportHandle,
}

pub enum TransportHandle {
    Stdio(stdio::StdioHandle),
}

pub type ConnectionMap = Arc<Mutex<HashMap<String, McpConnection>>>;

pub fn new_connection_map() -> ConnectionMap {
    Arc::new(Mutex::new(HashMap::new()))
}
