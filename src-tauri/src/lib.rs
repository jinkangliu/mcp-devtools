mod commands;
mod db;
mod mcp;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mcp-devtools.db", db::migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::server::connect_server,
            commands::server::disconnect_server,
            commands::tools::mcp_call_tool,
            commands::history::list_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
