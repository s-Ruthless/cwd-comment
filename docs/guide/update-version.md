# 更新部署

重新拉取 GitHub 项目代码。

## 后端更新

接口逻辑相关的更新，需要重新部署到 Cloudflare Workers.

```
cd cwd-api
npm install
npm run deploy
```

重新部署到 Cloudflare Workers.

## 前端更新

管理后台已内置在 API Worker 中，更新流程如下：

```bash
cd cwd-admin
npm install
npm run build
```

构建会自动将产物复制到 `cwd-api/public/admin/`，然后重新部署 API Worker：

```bash
cd ../cwd-api
npm run deploy
```

部署后访问 `https://your-api-worker.workers.dev/admin/` 即可使用最新版本的管理后台。

### 评论端

更新 api 时同步修改引入文件的版本号，源码文件 `/docs/widget`.
