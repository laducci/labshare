import { defineConfig } from 'vite'

export default defineConfig({
  // Vite transpiles JSX with esbuild. Keeping the pipeline Babel-free also
  // avoids the incompatible Babel runtime bundled in this prototype.
  esbuild: {
    jsx: 'automatic',
  },
})
