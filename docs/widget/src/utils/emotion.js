/**
 * 表情工具模块
 * 表情数据从后端 /api/emotions 接口动态获取，无需硬编码
 */

/**
 * 全局 API 基础 URL，由 CWDComments 设置
 */
let _apiBaseUrl = '';

/**
 * 缓存的 OwO 表情数据
 */
let _cachedOwoData = null;

/**
 * 设置 API 基础 URL
 * @param {string} url - API 基础 URL
 */
export function setApiBaseUrl(url) {
	_apiBaseUrl = (url || '').replace(/\/+$/, '');
}

/**
 * 异步获取表情数据（带缓存）
 * @returns {Promise<Object>} OwO 表情数据
 */
export async function fetchEmotionData() {
	if (_cachedOwoData) return _cachedOwoData;
	if (!_apiBaseUrl) return {};
	try {
		const res = await fetch(`${_apiBaseUrl}/api/emotions`);
		if (!res.ok) return {};
		const json = await res.json();
		_cachedOwoData = json.data || {};
		return _cachedOwoData;
	} catch (e) {
		console.error('fetchEmotionData failed:', e);
		return {};
	}
}

/**
 * 获取表情图片 URL
 * @param {string} packageName - 表情包名称 (aru, twemoji)
 * @param {string} iconName - 表情图标名称
 * @param {string} emotionUrl - 表情图片基础 URL
 * @returns {string} 完整的图片 URL
 */
export function getEmotionImageUrl(packageName, iconName, emotionUrl) {
	const baseUrl = (emotionUrl || '').replace(/\/+$/, '');
	return `${baseUrl}/${packageName}/${iconName}.png`;
}

/**
 * 替换文本中的表情语法 ::packageName:iconName:: 为 HTML img 标签
 * @param {string} text 包含表情语法的文本
 * @param {string} emotionUrl 表情图片基础 URL
 * @returns {string} 替换后的文本
 */
export function replaceEmotionSyntax(text, emotionUrl) {
	if (!text || !emotionUrl) return text;
	const baseUrl = emotionUrl.replace(/\/+$/, '');
	return text.replace(/::(\w+):(\w+)::/g, (match, pkg, icon) => {
		if (!/^[a-zA-Z]+$/.test(pkg) || !/^[a-zA-Z0-9]+$/.test(icon)) {
			return match;
		}
		return `<img src="${baseUrl}/${pkg}/${icon}.png" alt="${icon}" title="${icon}" class="cwd-emotion-img">`;
	});
}
