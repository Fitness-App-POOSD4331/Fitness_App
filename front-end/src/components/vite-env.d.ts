/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_API_URL?: string;
  readonly BASE_URL: string;
  // Add other env variables you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}