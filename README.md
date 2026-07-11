<div align="center">

<img src="https://cwd.js.org/icon.png" width="111" />

# CWD (Cloudflare Workers Discuss)

[![GitHub release](https://img.shields.io/github/v/release/anghunk/cwd?display_name=tag&style=flat-square)](https://github.com/anghunk/cwd/releases)
[![GitHub stars](https://img.shields.io/github/stars/anghunk/cwd?style=flat-square)](https://github.com/anghunk/cwd)
[![License](https://img.shields.io/github/license/anghunk/cwd?style=flat-square)](./LICENSE)
[![Docs](https://img.shields.io/badge/Docs-cwd.js.org-brightgreen?style=flat-square)](https://cwd.js.org)

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white&style=flat-square)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020?logo=cloudflare&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/node-%3E=20.0.0-339933?logo=node.js&logoColor=white&style=flat-square)

基于 Cloudflare Workers 与全球边缘网络的免服务器、极速安全、即插即用评论系统。

数据存储在 Cloudflare D1 数据库中，通过 Worker 与数据库交互。

[使用文档](https://cwd.js.org) · [社区交流](https://zs.discourse.group)

</div>

## Preview

**评论端**
![](https://github.com/user-attachments/assets/34096ce5-512d-4ddb-b409-edef6a2674ed)


**后台管理**
![](https://github.com/user-attachments/assets/7592e339-3a4f-4dd2-a71c-ff6d97621fd9)

<details><summary>更多截图</summary>
<p>

![](https://github.com/user-attachments/assets/59ef1a42-75f7-4efa-8a0c-beae71322484)
![](https://github.com/user-attachments/assets/2bffdfaf-4af4-4bd8-929f-a178bc4acb78)
![](https://github.com/user-attachments/assets/37cff92b-d6c7-4d1e-a9dd-856bac6ec8d3)

</p>
</details>

## 项目结构

```
cwd/
├── cwd-api/          # 后端 API + 管理后台（Cloudflare Worker）
│   ├── src/          #   Hono 框架的 API 源码
│   ├── public/       #   静态资源（表情图片、管理后台 SPA）
│   └── scripts/      #   部署脚本（自动生成 OwO.json、复制表情等）
├── cwd-admin/        # 管理后台源码（Vue 3 + Vite）
│   └── scripts/      #   构建后自动复制 dist 到 cwd-api/public/admin/
├── docs/             # 文档站（VitePress）+ 评论组件 Widget
│   └── widget/       #   前端评论组件源码
├── emotion/          # 表情图片资源
│   ├── aru/          #   阿鲁表情包
│   ├── twemoji/      #   推特表情包
│   ├── emoticons.json#   颜文字等文本表情
│   └── generate-owo.cjs # 自动扫描生成 OwO.json 的脚本
└── package.json
```

## 快速部署

### 前置要求

- Node.js 20+
- Cloudflare 账号
- Wrangler CLI（`npm install -g wrangler`）

### 1. 部署后端 API + 管理后台

```bash
cd cwd-api

# 安装依赖
npm install

# 编辑配置文件（填入你的 D1 数据库 ID、KV ID 等）
cp wrangler.jsonc.example wrangler.jsonc
# 编辑 wrangler.jsonc，修改 name、d1_databases、kv_namespaces、vars 等

# 部署到 Cloudflare Workers
npm run deploy
```

部署成功后：
- API 根路径：`https://your-worker.workers.dev/`
- 管理后台：`https://your-worker.workers.dev/admin/`

### 2. 构建管理后台（修改后台 UI 后需要）

管理后台已内置在 API Worker 中，默认无需单独构建。
如需修改后台界面：

```bash
cd cwd-admin
npm install
npm run build    # 构建并自动复制到 cwd-api/public/admin/

cd ../cwd-api
npm run deploy   # 重新部署 API Worker
```

### 3. 接入评论组件

在博客页面引入评论组件：

```html
<script src="https://your-worker.workers.dev/cwd.js"></script>
<div id="cwd-comments"></div>
<script>
  new CWDComments({
    apiBaseUrl: 'https://your-worker.workers.dev',
    el: '#cwd-comments'
  });
</script>
```

详细配置请参考 [前端配置文档](https://cwd.js.org/guide/frontend-config.html)。

## 更新日志（基于原版的增强）

本项目基于 [anghunk/cwd](https://github.com/anghunk/cwd) 进行了以下增强和改进：

### 管理后台合并部署

- **API + Admin 合并为一个 Worker**：不再需要单独部署 `cwd-admin`，管理后台作为静态资源内置在 API Worker 中
- 访问 `/admin/` 即可使用管理后台，无需配置 API 地址（同源请求）
- 后台管理 API 路径统一为 `/api/admin/*`，与 SPA 路由 `/admin/*` 分离，避免冲突
- 登录页移除了手动填写 API 地址的输入框，开箱即用
- 构建脚本自动将 `cwd-admin/dist` 复制到 `cwd-api/public/admin/`

### 表情系统增强

- **表情开关**：后台管理新增表情功能开关，可在功能设置中开启/关闭
- **CDN 配置**：后台支持配置表情图片的 CDN 地址，留空则自动使用 Worker 自身地址
- **自动扫描生成**：新增 `emotion/generate-owo.cjs` 脚本，部署时自动扫描 `emotion/` 目录生成 `OwO.json`
- **零配置添加表情包**：只需在 `emotion/` 下新建文件夹放入 `.png` 图片，可选创建 `meta.json` 自定义显示名和文字标签，重新部署即可
- **表情选择器 UI 优化**：修复了表情选择框定位问题，面板显示在按钮上方左对齐
- **表情图片不被灯箱识别**：评论中的表情图片不会触发图片灯箱，只有普通图片才触发
- 清理了未使用的 `OwO.min.js` 文件

### 评论组件改进

- **自定义主题色**：支持传入 `primaryColor` 动态改变组件颜色
- **表情选择器**：新增 `EmojiPicker` 组件，支持分类切换、搜索
- **回复编辑器优化**：回复他人评论时表情、预览、提交按钮样式和大小统一
- **管理员验证优化**：管理员验证后显示退出按钮，修复了点击弹出表情选择器的问题

### 其他改进

- Worker 名称从 `cwd-api` 改为 `cwd-comment`，更清晰地体现项目用途
- 更新了文档中所有 API 路径（`/admin/*` → `/api/admin/*`）
- 更新了部署文档，反映合并部署后的流程

## Thanks

感谢以下项目和人员的贡献：

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare D1](https://www.cloudflare.com/products/database/)
- [Momo-Backend](https://github.com/Motues/Momo-Backend)
- 原作者 [anghunk](https://github.com/anghunk) — CWD 评论系统的创建者

## LICENSE

开源协议：[Apache-2.0](./LICENSE)
