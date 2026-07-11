/**
 * 部署前自动生成并复制 emotion 表情资源到 public/emotion/
 *
 * 流程：
 * 1. 执行 emotion/generate-owo.cjs 自动扫描目录生成 OwO.json
 * 2. 复制表情图片到 public/emotion/（排除 meta.json、emoticons.json、generate-owo.cjs）
 * 3. 复制 OwO.json 到 src/data/owo.json（供 Worker import）
 *
 * 添加新表情包只需：
 *   1. 在 emotion/ 下新建文件夹，放入 .png 图片
 *   2. （可选）创建 meta.json 自定义显示名和文字标签
 *   3. 重新部署即可
 *
 * 同时确保 wrangler.jsonc 中包含 assets 静态资源配置
 */
const fs = require('fs');
const path = require('path');

// 复制时需要排除的文件（这些是配置/脚本文件，不应作为静态资源部署）
const EXCLUDE_FILES = new Set(['meta.json', 'emoticons.json', 'generate-owo.cjs', 'OwO.min.js', 'OwO.json']);

function copyDir(src, dest) {
	if (!fs.existsSync(src)) return;
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		if (EXCLUDE_FILES.has(entry.name)) continue;
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

/**
 * 确保 wrangler.jsonc 中包含 assets 配置
 * 如果没有，自动添加（因为 wrangler.jsonc 是 gitignored，用户可能没有手动添加）
 */
function ensureAssetsConfig() {
	const wranglerPath = path.resolve(__dirname, '..', 'wrangler.jsonc');
	if (!fs.existsSync(wranglerPath)) return;

	const content = fs.readFileSync(wranglerPath, 'utf-8');

	// 已经有 assets 配置，跳过
	if (/"assets"\s*:/.test(content)) return;

	// 在 "workers_dev" 或 "preview_urls" 行之后插入 assets 配置
	const assetsConfig = `\n\t"assets": {\n\t\t"directory": "./public"\n\t},`;

	let updated = content;
	// 尝试在 preview_urls 行后插入
	const previewMatch = content.match(/"preview_urls"\s*:\s*(true|false)\s*,?/);
	if (previewMatch) {
		updated = content.replace(
			/"preview_urls"\s*:\s*(true|false)\s*,?/,
			`"preview_urls": ${previewMatch[1]},${assetsConfig}`
		);
	} else {
		// 尝试在 workers_dev 行后插入
		const workersMatch = content.match(/"workers_dev"\s*:\s*(true|false)\s*,?/);
		if (workersMatch) {
			updated = content.replace(
				/"workers_dev"\s*:\s*(true|false)\s*,?/,
				`"workers_dev": ${workersMatch[1]},${assetsConfig}`
			);
		}
	}

	if (updated !== content) {
		fs.writeFileSync(wranglerPath, updated, 'utf-8');
		console.log('[Copy-Emotion] Added assets config to wrangler.jsonc');
	}
}

function run() {
	try {
		const emotionDir = path.resolve(__dirname, '..', '..', 'emotion');
		const publicEmotionDir = path.resolve(__dirname, '..', 'public', 'emotion');
		const dataDir = path.resolve(__dirname, '..', 'src', 'data');

		// 确保 wrangler.jsonc 包含 assets 配置
		ensureAssetsConfig();

		if (!fs.existsSync(emotionDir)) {
			console.log('[Copy-Emotion] emotion/ directory not found, skipping.');
			return;
		}

		// 1. 执行 generate-owo.cjs 自动生成 OwO.json
		const generateScript = path.join(emotionDir, 'generate-owo.cjs');
		if (fs.existsSync(generateScript)) {
			console.log('[Copy-Emotion] Running generate-owo.cjs...');
			require(generateScript);
		}

		// 2. 复制表情图片到 public/emotion/（自动排除配置文件）
		copyDir(emotionDir, publicEmotionDir);
		console.log('[Copy-Emotion] Copied emotion images to public/emotion/');

		// 3. 复制 OwO.json 到 src/data/owo.json（供 Worker import）
		const owoSrc = path.join(emotionDir, 'OwO.json');
		if (fs.existsSync(owoSrc)) {
			fs.mkdirSync(dataDir, { recursive: true });
			fs.copyFileSync(owoSrc, path.join(dataDir, 'owo.json'));
			console.log('[Copy-Emotion] Copied OwO.json to src/data/owo.json');
		}
	} catch (error) {
		console.error('[Copy-Emotion] Failed:', error.message);
		// 不中断部署流程，因为可能已经手动复制过了
	}
}

run();
