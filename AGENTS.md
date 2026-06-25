# AGENTS.md — 万物对比平台

> 给 AI Agent / 新成员的快速上手文档。
> 详细架构见 `docs/architecture.md`，业务逻辑见 `docs/spec.md`。
> 建议每隔几周回顾一次，把"Agent 又踩的坑"补进来。

---

## 项目简介

这是一个**万物对比平台**（Universal Comparison Platform）的全栈项目。
用户可以通过截图、链接、手动输入等方式添加任意对象（商品、服务、概念、方案……），
由 AI 自动提取关键属性、生成对比维度、输出分析报告。

**技术栈：**
- 后端：Python 3.12 + FastAPI + SQLAlchemy 2.0
- 前端：React 18 + TypeScript + Tailwind CSS + Vite
- 数据库：PostgreSQL 16（本地用 Docker，线上用 Supabase）
- AI：Anthropic Claude API（多模态，支持图片 + 文字）
- 爬虫：Playwright（无头 Chromium）
- 部署：后端 Railway，前端 Vercel，DB Supabase

**开发环境：** Windows + WSL2（所有命令在 WSL2 终端内执行）

---

## 代码结构

```
compare-anything/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 应用入口，注册路由和中间件
│   │   ├── config.py            # 环境变量读取（pydantic-settings）
│   │   ├── database.py          # DB engine / session / get_db 依赖
│   │   ├── models/              # SQLAlchemy ORM 表定义
│   │   │   ├── item.py          # 对比对象表（核心，改前看下面红线）
│   │   │   └── comparison.py    # 对比记录表
│   │   ├── schemas/             # Pydantic 请求/响应格式
│   │   │   ├── item.py
│   │   │   └── comparison.py
│   │   ├── routers/             # 路由层，只做参数校验和调用 service
│   │   │   ├── items.py         # /items 系列接口
│   │   │   └── comparisons.py   # /compare 系列接口
│   │   └── services/            # 业务逻辑层，所有重活在这里
│   │       ├── extractor.py     # 统一入口：URL/图片/文字 → 结构化 item
│   │       ├── scraper.py       # Playwright 网页爬取
│   │       ├── ocr.py           # Claude Vision 截图识别
│   │       └── ai_compare.py    # Claude 对比分析 + 流式输出
│   ├── migrations/              # Alembic 数据库迁移，只增不改
│   ├── tests/                   # pytest，文件名 test_*.py
│   ├── .env                     # 本地敏感配置，不上传 Git
│   ├── .env.example             # .env 模板，新成员复制这个
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # React 应用入口
│   │   ├── App.tsx              # 路由配置
│   │   ├── pages/               # 页面级组件
│   │   │   ├── Home.tsx         # 添加对象 + 触发对比
│   │   │   └── Result.tsx       # 对比结果 + AI 分析展示
│   │   ├── components/          # 可复用 UI 组件
│   │   │   ├── ItemCard.tsx     # 单个对象卡片
│   │   │   ├── CompareTable.tsx # 横向对比表格
│   │   │   └── AiStream.tsx     # 流式 AI 文字输出
│   │   ├── api/                 # 所有后端请求封装，不在组件里直接 fetch
│   │   │   └── client.ts
│   │   └── types/               # TypeScript 类型定义
│   │       └── index.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docs/
│   ├── architecture.md          # 详细系统架构图（本文件不展开）
│   └── spec.md                  # 业务逻辑和需求细节（本文件不展开）
│
├── docker-compose.yml           # 本地一键启动 PostgreSQL + Redis
├── Makefile                     # 所有常用命令的快捷方式
└── AGENTS.md                    # 本文件
```

---

## 核心概念约定

| 术语 | 含义 | 注意 |
|------|------|------|
| **Item** | 被对比的任意对象 | 不叫 Product，因为可以是任何东西 |
| **Comparison** | 一次对比会话，包含多个 Item | 至少 2 个 Item 才能触发 |
| **source_type** | Item 的来源：`url` / `image` / `manual` | 决定走哪条提取路径 |
| **specs** | JSON 字段，存 AI 提取的属性键值对 | 结构不固定，按品类动态生成 |
| **dimension** | 对比维度，如"价格""性能" | 由 AI 根据 Item 品类自动选取 |

---

## 编码规范

**Python（后端）**
- 错误处理：业务错误抛 `HTTPException(status_code=..., detail="...")`，服务层内部用 `raise ValueError("doing X: reason")` 向上传
- 日志：用 `import logging; logger = logging.getLogger(__name__)`，不要用 `print()`
- 类型：所有函数都要写类型注解，返回值也要
- 异步：FastAPI 路由用 `async def`，调用爬虫/AI 用 `await`；纯 DB 操作可用同步 `def`
- 测试：pytest + 表驱动，文件名 `test_*.py`，放 `tests/` 目录下
- 注释：只给非显而易见的逻辑写注释，不写"这行代码做了 X"的废话注释

**TypeScript（前端）**
- 不用 `any`，实在不确定类型用 `unknown` 然后做 narrowing
- 所有后端 API 调用封装在 `src/api/client.ts`，组件里不直接写 `fetch`
- 组件文件名用 PascalCase（`ItemCard.tsx`），工具函数用 camelCase（`formatPrice.ts`）
- CSS 只用 Tailwind utility class，不新建 `.css` 文件（除非是全局 reset）

**通用**
- commit message 格式：`type(scope): 描述`，例如 `feat(ocr): 支持 WebP 截图格式`
- 环境变量命名全大写下划线：`ANTHROPIC_API_KEY`，不要 `anthropicApiKey`

---

## 常用命令

```bash
# ── 后端 ──────────────────────────────────────────────
cd backend

# 初始化（第一次）
cp .env.example .env          # 填入 API Key 和 DB 连接串
pip install -r requirements.txt

# 启动本地开发服务器（代码改动自动重载）
make dev
# 等价于: uvicorn app.main:app --reload --port 8000

# 启动本地数据库（需要 Docker Desktop 运行中）
make db-up
# 等价于: docker compose up -d postgres

# 数据库迁移
make migrate-up               # 应用所有待执行的迁移
make migrate-new name=xxx     # 新建迁移文件

# 跑测试
make test                     # 全量测试
make test-v                   # 详细输出

# Lint（提 PR 前必须通过）
make lint
# 等价于: ruff check . && mypy app/

# ── 前端 ──────────────────────────────────────────────
cd frontend

npm install                   # 第一次初始化
npm run dev                   # 启动开发服务器 http://localhost:5173
npm run build                 # 构建生产包
npm run lint                  # ESLint 检查

# ── 接口文档 ──────────────────────────────────────────
# 后端启动后访问（无需 Postman）：
# http://localhost:8000/docs     Swagger UI，可直接点按钮测试
# http://localhost:8000/redoc    ReDoc 风格文档
```

---

## 关键接口速查

| Method | Path | 说明 |
|--------|------|------|
| `POST` | `/items/url` | 通过链接添加对比对象 |
| `POST` | `/items/image` | 上传截图添加对比对象 |
| `POST` | `/items/manual` | 手动输入文字添加对比对象 |
| `GET`  | `/items` | 获取所有对象列表 |
| `POST` | `/compare` | 触发 AI 对比，SSE 流式返回 |
| `GET`  | `/compare/{id}` | 获取历史对比结果 |

流式接口（`POST /compare`）返回 `text/event-stream`，
前端用 `EventSource` 或 `fetch` + `ReadableStream` 消费，见 `src/components/AiStream.tsx`。

---

## AI 调用约定

- **提取阶段**（URL/截图 → 结构化属性）用 `claude-haiku-4-5-20251001`，便宜 10 倍
- **对比分析阶段**（生成报告）用 `claude-sonnet-4-6`，质量更好
- Prompt 模板统一放在 `app/services/` 各文件顶部的 `PROMPT_*` 常量里，不要散落在函数体内
- 所有调用必须设置 `max_tokens`，不要留空让它自由生长
- Claude 返回 JSON 时，在 prompt 里明确写"只返回 JSON，不要 markdown 代码块"，解析前用 `.strip()` 去掉可能的空白

---

## 禁止事项

- **不要修改 `migrations/` 下已存在的迁移文件**，只能新增。已执行的迁移改了会导致其他人数据库状态不一致
- **不要在 `routers/` 里写业务逻辑**，router 只做参数校验和调用 service，厚 router = 以后没法测试
- **不要把 `ANTHROPIC_API_KEY` 或任何 key 硬编码进代码**，全部走 `.env` + `config.py`
- **不要在生产代码里留 `# TODO`**，要么当场做，要么开 GitHub Issue 记录
- **不要用 `float` 存价格**，价格字段统一用 `String` 存（含货币符号），显示时再处理，避免浮点精度问题
- **`specs` 字段是 JSON，不要假设它有固定结构**，每次读取前做 `if specs and "key" in specs` 判断
- commit 前必须在本地跑一次 `make lint`，CI 会强制检查，红了要自己修

---

## 容易踩的坑

- **PostgreSQL 时区是 UTC**，`created_at` 存的是 UTC 时间，返回给前端时要在前端做本地化转换，不要在后端转
- **Playwright 在 WSL2 里首次运行需要额外装依赖**：`playwright install-deps chromium`，不装会报找不到 `.so` 的错
- **流式接口 CORS**：`StreamingResponse` + CORS 在某些浏览器下会先发 OPTIONS 预检，确保 `CORSMiddleware` 的 `allow_methods` 包含 `POST`
- **`specs` 存 JSON 时 SQLAlchemy 不会自动 deep diff**，更新前必须用 `flag_modified(obj, "specs")` 标记字段为脏，否则 `db.commit()` 不会保存变更
- **前端 SSE 断连**：`EventSource` 默认断了会自动重连，对比接口是一次性的，完成后后端要发 `event: done\ndata: \n\n` 让前端主动关闭连接，否则会无限重试
- **Vite 开发时 proxy**：前端调后端接口要走 `vite.config.ts` 里的 proxy 配置（`/api → localhost:8000`），不要在代码里硬写 `localhost:8000`，否则部署后要改一堆地方

---

*最后更新：项目初始化阶段 — 遇到新坑请直接补充到"容易踩的坑"章节*
