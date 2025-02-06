/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        buffer: 'buffer/',
        stream: 'stream-browserify',
      },
    },
    define: {
      'process.env': {
        VITE_BACKEND_URL: JSON.stringify(env.VITE_BACKEND_URL),
        VITE_DEFAULT_AI_SERVICE: JSON.stringify(env.VITE_DEFAULT_AI_SERVICE),
        VITE_VERTEX_AI_PROJECT_ID: JSON.stringify(env.VITE_VERTEX_AI_PROJECT_ID),
        VITE_VERTEX_AI_LOCATION: JSON.stringify(env.VITE_VERTEX_AI_LOCATION),
        VITE_VERTEX_AI_MODEL_ID: JSON.stringify(env.VITE_VERTEX_AI_MODEL_ID),
        NODE_ENV: JSON.stringify(mode)
      },
      global: {},
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/**',  // Playwrightのテストを除外
        '**/tests-examples/**',  // Playwrightの例示テストを除外
        '**/e2e/**'
      ]
    },
    server: {
      proxy: {
        '/api/dify': {
          target: 'https://api.dify.ai',
          changeOrigin: true,
          rewrite: (path: string) => {
            console.log('Rewriting path:', path);
            return path.replace(/^\/api\/dify/, '/v1');
          },
          secure: false,
          configure: (proxy: any, _options: any) => {
            proxy.on('error', (err: Error, _req: any, _res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
              console.log('Sending Request:', {
                method: req.method,
                url: req.url,
                headers: proxyReq.getHeaders()
              });
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
              console.log('Received Response:', {
                statusCode: proxyRes.statusCode,
                url: req.url,
                headers: proxyRes.headers
              });
            });
          },
        },
      },
    },
  } as UserConfig
}) 