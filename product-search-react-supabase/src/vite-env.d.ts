/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALGOLIA_APPLICATION_ID: string
  readonly VITE_ALGOLIA_SEARCH_API_KEY: string
  /** Optional. Falls back to the connector's default index name. */
  readonly VITE_ALGOLIA_INDEX_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
