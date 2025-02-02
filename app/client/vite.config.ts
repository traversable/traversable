import * as path from 'node:path'
import { defineConfig, PluginOption } from 'vite'

import react from '@vitejs/plugin-react'
import inspect from 'vite-plugin-inspect'
import { watchAndRun } from 'vite-plugin-watch-and-run'

const PATH = {
  schemas: path.join(path.resolve(), 'src', 'schemas', '**/*.json'),
} as const

console.log("PATH.schemas", PATH.schemas)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inspect(),
    watchAndRun(
      [
        {
        name: '״ⵉಠಎ༵ಠ‹',
          run: './bin/gen.ts',
          watch: PATH.schemas,
        }
      ]
    ) as PluginOption,
  ],
  build: {
    rollupOptions: {
      external: [
      '@traversable/data',
      '@traversable/registry',
      '@traversable/openapi',
      ]
    },
  },
  optimizeDeps: {
    exclude: [
      // '@traversable/data',
      // '@traversable/registry',
      // '@traversable/openapi',
    ]
  },
})


// import { dirname, resolve } from 'node:path'
// import { fileURLToPath } from 'node:url'
// import { defineConfig } from 'vite'

// const __dirname = dirname(fileURLToPath(import.meta.url))

// export default defineConfig({
//   build: {
//     lib: {
//       entry: {
//         'my-lib': resolve(__dirname, 'lib/main.js'),
//         secondary: resolve(__dirname, 'lib/secondary.js'),
//       },
//       name: 'MyLib',
//     },
//     rollupOptions: {
//       // make sure to externalize deps that shouldn't be bundled
//       // into your library
//       external: ['vue'],
//       output: {
//         // Provide global variables to use in the UMD build
//         // for externalized deps
//         globals: {
//           vue: 'Vue',
//         },
//       },
//     },
//   },
// })
