#[tauri::command]
pub async fn connect_server() -> Result<String, String> {
    Ok("stub".to_string())
}

#[tauri::command]
pub async fn disconnect_server() -> Result<(), String> {
    Ok(())
}
