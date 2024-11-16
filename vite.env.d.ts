/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly bob: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

