/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OFFLINE_UNRESTRICTED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
