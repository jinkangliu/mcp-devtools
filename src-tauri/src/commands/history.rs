#[tauri::command]
pub async fn list_history() -> Result<Vec<String>, String> {
    Ok(vec![])
}
