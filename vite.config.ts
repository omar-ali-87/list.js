import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))
const banner = `/*! List.js v${packageJson.version} */`

// Build unminified version
const unminifiedConfig = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', '__test__/**/*'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'List',
      formats: ['umd'],
      fileName: () => 'list.js',
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        banner,
      },
    },
  },
})

// Build minified version
const minifiedConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'List',
      formats: ['umd'],
      fileName: () => 'list.min.js',
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: /^! List.js v.*/,
      },
    },
    rollupOptions: {
      output: {
        banner,
      },
    },
  },
})

// Export function that returns config based on mode
export default defineConfig(({ mode }) => {
  // Build minified version when mode is 'minified'
  if (mode === 'minified') {
    return minifiedConfig
  }
  // Otherwise build unminified version
  return unminifiedConfig
})
