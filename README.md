# Base64 工具（在线编码/解码 & 图片预览）

一个专注体验与隐私的 Base64 在线工具：支持文本 Base64 编码/解码，以及图片 Base64 / Data URL 预览。

## 功能

- 文本 Base64 编码 / 解码（UTF-8）
- URL-safe 编码（`+ /` ↔ `- _`）与可选移除末尾 `=`
- 解码时可忽略空白字符、可自动移除 `data:*;base64,` 前缀
- 图片 Base64 / Data URL 直接渲染预览（可自动识别 PNG/JPG/GIF/WebP/SVG 等）
- 快捷键：`Ctrl` / `⌘` + `Enter`

## 本地开发

> 建议使用 `pnpm`（仓库已包含 `pnpm-lock.yaml`）。

```bash
pnpm install
pnpm dev
```

然后访问 `http://localhost:3000`。

## 常用命令

```bash
pnpm dev        # 本地开发
pnpm build      # 构建
pnpm start      # 生产启动
pnpm lint       # ESLint
pnpm test       # Vitest（单次运行）
pnpm test:watch # Vitest（监听）
```

## 目录结构（简要）

- `src/app/page.tsx`：首页
- `src/components/base64-tool.tsx`：工具 UI 逻辑
- `src/lib/base64.ts`：Base64 核心实现（解析/规范化/编码/解码/图片类型推断）

## 隐私说明

默认在浏览器本地处理输入内容，不会因操作而上传；但粘贴敏感信息前仍建议自行评估风险并做好脱敏。
