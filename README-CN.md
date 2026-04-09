# MCP DevTools

> MCP 的 Postman —— 面向 MCP Server 开发者的交互式调试与测试工具。

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## 这是什么？

MCP DevTools 让你连接到任意 [MCP Server](https://modelcontextprotocol.io)，浏览它的所有工具，并通过自动生成的表单 UI 或原始 JSON 编辑器直接调用它们。

就像 Postman，但专为 Model Context Protocol 设计。

## 功能特性

- **连接** MCP Server：支持 stdio（本地进程）和 HTTP+SSE（远程服务）
- **浏览** 所有可用工具及其描述
- **自动生成表单** —— 根据 JSON Schema 自动生成输入表单，无需手写 JSON
- **Monaco JSON 编辑器** —— 语法高亮、Schema 校验、智能补全
- **双向同步** —— 表单模式与 JSON 模式随时切换，数据实时同步
- **调用历史** —— 记录每次请求与响应时间
- **错误分类** —— 区分 MCP 协议错误、工具执行错误与网络错误

## 快速开始

### 环境要求

- [Rust](https://rustup.rs/)（1.70+）
- Node.js 18+

### 开发模式运行

```bash
npm install
npm run tauri dev
```

### 连接你的第一个 MCP Server

1. 点击左侧面板的 **+** 按钮
2. 选择传输方式：
   - `stdio` —— 本地服务（最常用）
   - `HTTP+SSE` —— 远程服务
3. 填写启动 MCP Server 的命令

**示例 —— filesystem server：**
```
Command:   npx
Arguments: -y @modelcontextprotocol/server-filesystem /tmp
```

**示例 —— 内置测试服务：**
```
Command:   node
Arguments: /your/absolute/path/to/examples/test-server.js
```
> 注意：Arguments 需填写 `examples/test-server.js` 的**绝对路径**。

## 技术架构

| 层 | 技术选型 |
|----|---------|
| 桌面壳 | Tauri 2（Rust）|
| 前端框架 | React + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS v4 |
| 代码编辑器 | Monaco Editor |
| 本地存储 | SQLite（tauri-plugin-sql）|
| MCP 协议 | 自实现 stdio / HTTP+SSE 传输 |

选择 Tauri 而非 Electron：包体积约 8MB vs Electron 的 ~150MB，启动更快，资源占用更低。

## 路线图

- **Phase 2** —— 测试框架：将调用录制为测试用例，支持 CI 批量运行
- **Phase 3** —— 可观测性：调用时序图、P95 延迟统计、实时请求日志

## 参与贡献

欢迎提 Issue 和 PR。

## License

MIT
