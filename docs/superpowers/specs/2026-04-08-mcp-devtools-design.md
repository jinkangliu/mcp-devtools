# MCP DevTools — Design Spec

**Date:** 2026-04-08
**Status:** Approved

---

## 1. 项目定位

**一句话定位：** Postman for MCP — 面向 MCP Server 开发者的交互式调试与测试工具。

**背景：** MCP（Model Context Protocol）是 Anthropic 于 2024 年底开源的协议，已成为 AI Agent 与外部工具集成的事实标准。GitHub 上 MCP Server 相关仓库数以万计，但没有一个像样的调试工具。MCP DevTools 填补这一空白。

**目标用户：** MCP Server 开发者、AI Agent 工程师、需要调试和测试 MCP 工具集成的开发团队。

**核心价值：**
- 可视化调试任意 MCP Server 的所有 Tool
- 自动根据 JSON Schema 生成调用表单，降低调试门槛
- 内置测试框架，支持 CI/CD 集成
- 长线演进为 MCP 生态的可观测性平台

---

## 2. 功能范围

### Phase 1 — 调试核心（Month 1，MVP）

- **Server 连接管理**：通过 stdio / HTTP+SSE 连接 MCP Server，自动发现并列出所有 Tool
- **左侧树形导航**：Server 列表 → Tool 列表，支持折叠/展开
- **交互式调用面板**：
  - 表单模式：根据 Tool 的 JSON Schema 自动生成输入表单，标注必填字段
  - JSON 模式：Monaco Editor，语法高亮 + 自动补全
  - 一键切换两种模式，数据双向同步
- **响应展示**：状态、耗时、JSON 高亮渲染，区分成功/错误
- **调用历史**：持久化保存每次 request/response，支持快速复用
- **错误分类**：区分 MCP 协议错误 / 工具执行错误 / 网络错误

### Phase 2 — 测试框架（Month 2-3）

- **用例录制**：将一次成功的调用保存为测试用例（含期望响应断言）
- **测试套件运行**：批量执行测试用例，展示通过/失败报告
- **CLI 模式**：`mcp-devtools test --config ./tests.json`，可接入 GitHub Actions 等 CI/CD

### Phase 3 — 可观测性（Month 4-6）

- **调用时序图**：可视化 Agent 调用多个工具的执行顺序和耗时瀑布图
- **性能分析**：每个 Tool 的响应时间统计（P50/P95/Max）
- **实时请求日志**：监听 Server 所有 incoming 请求的实时面板

---

## 3. UI 设计

**整体布局：** Postman 风格
- 左侧：Server/Tool 树形导航面板（可折叠）
- 右侧：调用面板（参数输入 + 响应展示）
- 底部（可选）：历史记录抽屉

**调用面板核心交互：**
- 顶部 Tab 切换：`Form` | `JSON`
- Form 模式：根据 JSON Schema 自动生成表单字段，标注 required/optional/类型
- JSON 模式：Monaco Editor，支持 Schema 驱动的智能补全
- 右上角：`▶ Send` 按钮，`Save as Test Case`，`History`
- 响应区：状态码 badge、耗时、JSON 树形展示

---

## 4. 技术架构

### 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 前端框架 | React + TypeScript | 主力栈，生态成熟 |
| UI 组件 | shadcn/ui + Tailwind CSS | 高颜值、可定制、开源友好 |
| 代码编辑器 | Monaco Editor | JSON Schema 补全、语法高亮 |
| 桌面壳 | Tauri（Rust） | 比 Electron 轻 10x，包体积 5-10MB |
| MCP 协议层 | `@modelcontextprotocol/sdk`（Node.js via Tauri Sidecar） | 复用官方 SDK，协议兼容性最佳 |
| 本地存储 | SQLite（via tauri-plugin-sql） | 历史记录、测试用例持久化 |
| 测试框架 | Vitest + 自研 MCP Test Runner CLI | 轻量，CI 友好 |

### 架构图

```
┌─────────────────────────────────────────┐
│           Tauri 桌面应用                  │
│  ┌──────────────────────────────────┐   │
│  │     React UI（前端渲染层）         │   │
│  │  LeftPanel │ CallPanel │ History  │   │
│  └──────────┬───────────────────────┘   │
│             │ Tauri IPC                  │
│  ┌──────────▼───────────────────────┐   │
│  │     Rust 后端（Tauri Core）        │   │
│  │  MCP Client │ SQLite │ Test Runner│   │
│  └──────────┬───────────────────────┘   │
│             │ stdio / HTTP+SSE           │
└─────────────┼───────────────────────────┘
              │
   ┌──────────▼──────────┐
   │   用户的 MCP Server  │
   └─────────────────────┘
```

**关键架构决策：**
- 选 Tauri 而非纯 Web：MCP Server 大量使用 stdio 传输，浏览器无法直接 spawn 子进程，Tauri Rust 后端可以。
- 选 Tauri 而非 Electron：包体积（Electron ~150MB vs Tauri ~8MB），对开发者工具的第一印象至关重要。
- MCP 协议通信全在后端：前端只负责 UI 渲染，通过 Tauri IPC 与 Rust 后端通信，架构职责清晰。

---

## 5. 数据流

### 调用一个 Tool 的完整流程

```
用户填写参数（表单/JSON）
        ↓
React → Tauri IPC: invoke("mcp_call_tool", { server_id, tool_name, params })
        ↓
Rust 后端查找对应 MCP Client 实例
        ↓
MCP Client → MCP Server: tools/call 请求
        ↓
MCP Server 执行 → 返回 result / error
        ↓
Rust 后端写入 SQLite 历史记录
        ↓
前端展示响应、耗时、状态
```

### Tauri IPC 命令契约

| 命令 | 入参 | 返回 |
|------|------|------|
| `connect_server` | `{ transport, config }` | `{ server_id, tools[] }` |
| `disconnect_server` | `{ server_id }` | `void` |
| `mcp_call_tool` | `{ server_id, tool_name, params }` | `{ result, duration_ms, error? }` |
| `list_history` | `{ server_id?, limit }` | `HistoryEntry[]` |
| `save_test_case` | `{ name, call, expected }` | `{ test_id }` |
| `run_tests` | `{ suite_id? }` | `TestResult[]` |

### SQLite Schema

```sql
-- Server 连接配置
CREATE TABLE servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transport TEXT NOT NULL,  -- 'stdio' | 'http-sse'
  config_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- 调用历史
CREATE TABLE history (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  params_json TEXT NOT NULL,
  result_json TEXT,
  duration_ms INTEGER,
  error TEXT,
  called_at INTEGER NOT NULL
);

-- 测试用例
CREATE TABLE test_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  params_json TEXT NOT NULL,
  expected_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### MCP 传输协议支持优先级

1. **stdio**（Phase 1）— 本地开发 Server 最常用
2. **HTTP + SSE**（Phase 1）— 远程 Server
3. **WebSocket**（Phase 2）

---

## 6. 开源策略

**仓库结构：**
```
mcp-devtools/
├── src/                 # React 前端
├── src-tauri/           # Rust 后端
├── docs/                # 文档
└── examples/            # 示例 MCP Server 配置
```

**License：** MIT

**Star 增长路径：**

1. **发布时机与渠道**：MVP 完成后同步发布到 Hacker News「Show HN」、Reddit r/LocalLLaMA、X(Twitter)，配 30 秒 GIF 演示调试 filesystem MCP Server 全流程
2. **README 即产品页**：顶部动态 GIF + 一句话定位「Postman for MCP」+ 三行内安装命令 + 徽章（stars/license/downloads）
3. **生态绑定**：向 `awesome-mcp-servers`、`modelcontextprotocol/servers` 提 PR，加入工具推荐列表，获取持续自然流量

**里程碑：**

| 时间 | 目标 | 行动 |
|------|------|------|
| Month 1 | MVP 可用 | 内测，录 demo GIF，完善 README |
| Month 2 | 首次公开发布 | HN + Reddit + Twitter 同步投放 |
| Month 3 | Phase 2 测试框架 | 博客「如何用 MCP DevTools 做集成测试」|
| Month 6 | Phase 3 可观测性 | 对标 LangSmith，主打开源免费 |
