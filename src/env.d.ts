/// <reference types="vite/client" />

interface ImportMetaEnv {
  // バックエンド接続設定
  readonly VITE_BACKEND_URL: string;
  
  // Google Cloud設定
  readonly VITE_GOOGLE_CLOUD_PROJECT_ID: string;
  readonly VITE_VERTEX_LOCATION: string;
  readonly VITE_VERTEX_MODEL: string;
  
  // AI設定
  readonly VITE_DEFAULT_AI_SERVICE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 