/**
 * 构建后自动将 admin dist 产物复制到 cwd-api/public/admin/
 * 这样 API Worker 部署时会一并上传 admin 前端静态资源
 * 访问 /admin/ 即可使用后台管理面板
 */
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		// 跳过 Cloudflare Worker 配置文件和 .assetsignore
		if (entry.name === 'wrangler.json' || entry.name === '.assetsignore') continue;
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function run() {
	try {
		const distDir = path.resolve(__dirname, '..', 'dist');
		const apiPublicAdminDir = path.resolve(__dirname, '..', '..', 'cwd-api', 'public', 'admin');

		if (!fs.existsSync(distDir)) {
			console.error('[Copy-to-API] dist/ directory not found, skipping.');
			return;
		}

		// 清除旧的 admin 目录（避免残留旧 hash 文件）
		if (fs.existsSync(apiPublicAdminDir)) {
			fs.rmSync(apiPublicAdminDir, { recursive: true, force: true });
		}

		copyDir(distDir, apiPublicAdminDir);
		console.log('[Copy-to-API] Copied admin dist to cwd-api/public/admin/');
	} catch (error) {
		console.error('[Copy-to-API] Failed:', error.message);
	}
}

run();
