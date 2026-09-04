import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vercel's Algolia integration injects ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY and
  // ALGOLIA_WRITE_API_KEY. Vite only exposes VITE_-prefixed variables to the browser,
  // so the two public ones are mapped across below.
  //
  // Never map ALGOLIA_WRITE_API_KEY here. It is present in the build environment on
  // Vercel, and anything defined on import.meta.env is inlined into public JavaScript.
  //
  // VITE_ALGOLIA_INDEX_NAME needs no mapping -- it is already VITE_-prefixed, so Vite
  // picks it up on its own.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ALGOLIA_APPLICATION_ID': JSON.stringify(
        env.VITE_ALGOLIA_APPLICATION_ID || env.ALGOLIA_APP_ID || '',
      ),
      'import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY': JSON.stringify(
        env.VITE_ALGOLIA_SEARCH_API_KEY || env.ALGOLIA_SEARCH_API_KEY || '',
      ),
    },
  }
})
