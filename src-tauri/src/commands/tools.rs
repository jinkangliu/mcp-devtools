#[tauri::command]
pub async fn mcp_call_tool() -> Result<String, String> {
    Ok("stub".to_string())
}
