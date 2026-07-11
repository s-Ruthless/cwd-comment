/**
 * 自动扫描 emotion/ 目录，生成 OwO.json
 *
 * 工作原理：
 * 1. 读取 emoticons.json（颜文字等文本表情，手动维护）
 * 2. 扫描所有子目录（如 aru/、twemoji/），每个子目录视为一个图片表情包
 * 3. 如果子目录中有 meta.json，使用其中的 displayName 和 items（图标文字标签）
 * 4. 如果没有 meta.json，用目录名作为显示名，文件名作为图标文字
 * 5. 合并所有内容，生成 OwO.json
 *
 * 添加新表情包只需：
 *   1. 在 emotion/ 下新建文件夹（如 mypack/）
 *   2. 放入 .png 图片
 *   3. （可选）创建 meta.json 自定义显示名和文字标签
 *   4. 重新部署即可
 */
const fs = require('fs');
const path = require('path');

function run() {
	const emotionDir = path.resolve(__dirname);

	// 1. 读取文本表情（颜文字等）
	const emoticonsPath = path.join(emotionDir, 'emoticons.json');
	const result = {};

	if (fs.existsSync(emoticonsPath)) {
		const emoticons = JSON.parse(fs.readFileSync(emoticonsPath, 'utf-8'));
		Object.assign(result, emoticons);
		console.log('[Generate-OwO] Loaded emoticons.json');
	}

	// 2. 扫描子目录，生成图片表情包
	const entries = fs.readdirSync(emotionDir, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (entry.name === 'node_modules') continue;

		const packDir = path.join(emotionDir, entry.name);
		const metaPath = path.join(packDir, 'meta.json');

		// 读取 meta.json（可选）
		let meta = {};
		if (fs.existsSync(metaPath)) {
			try {
				meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
			} catch (e) {
				console.warn(`[Generate-OwO] Failed to parse ${entry.name}/meta.json: ${e.message}`);
			}
		}

		// 扫描 .png 文件
		const pngFiles = fs.readdirSync(packDir)
			.filter(f => f.toLowerCase().endsWith('.png'))
			.sort();

		if (pngFiles.length === 0) continue;

		const displayName = meta.displayName || entry.name;
		const itemsMap = meta.items || {};

		const container = pngFiles.map(file => {
			const iconName = path.basename(file, '.png');
			return {
				icon: iconName,
				text: itemsMap[iconName] || iconName,
			};
		});

		result[displayName] = {
			type: 'image',
			name: entry.name,
			container,
		};

		console.log(`[Generate-OwO] Scanned pack "${entry.name}" (${displayName}): ${container.length} icons`);
	}

	// 3. 写入 OwO.json
	const owoPath = path.join(emotionDir, 'OwO.json');
	fs.writeFileSync(owoPath, JSON.stringify(result, null, 2) + '\n', 'utf-8');
	console.log(`[Generate-OwO] Generated OwO.json with ${Object.keys(result).length} categories`);
}

run();
