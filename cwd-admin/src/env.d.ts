/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_ADMIN_NAME?: string;
	readonly VITE_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.json" {
	const value: any;
	export default value;
}
