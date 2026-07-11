// Admin 和 API 现在在同一个 Worker 上，默认使用同源地址。
// 保留 localStorage 覆盖能力以兼容旧版部署场景。
export function getApiBaseUrl(): string {
	const stored = (localStorage.getItem('cwd_admin_api_base_url') || '').trim();
	const apiBaseUrl = stored.replace(/\/+$/, '');
	// 如果没有存储的值，返回空字符串（同源请求）
	return apiBaseUrl;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
	const apiBaseUrl = getApiBaseUrl();
	const token = localStorage.getItem('cwd_admin_token');
	const headers: HeadersInit = {};
	if (body !== undefined) {
		headers['Content-Type'] = 'application/json';
	}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}
	const res = await fetch(`${apiBaseUrl}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
	let data: any = null;
	try {
		data = await res.json();
	} catch {
		data = null;
	}
	if (!res.ok) {
		const message = data && data.message ? data.message : `请求失败，状态码 ${res.status}`;
		if (res.status === 401 && (message === 'Token expired or invalid' || message === 'Unauthorized')) {
			localStorage.removeItem('cwd_admin_token');
			if (typeof window !== 'undefined') {
				try {
					const url = new URL(window.location.href);
					// 保持 base path /admin/
					url.pathname = '/admin/login';
					url.search = '';
					url.hash = '';
					window.location.href = url.toString();
				} catch {
					window.location.href = '/admin/login';
				}
			}
		}
		throw new Error(message);
	}
	return data as T;
}

export function get<T>(path: string): Promise<T> {
	return request<T>('GET', path);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
	return request<T>('POST', path, body);
}

export function put<T>(path: string, body?: unknown): Promise<T> {
	return request<T>('PUT', path, body);
}

export function del<T>(path: string): Promise<T> {
	return request<T>('DELETE', path);
}
