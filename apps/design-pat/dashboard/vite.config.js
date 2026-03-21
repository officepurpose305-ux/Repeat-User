import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-output-files',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            // Serve files from ../output directory
            if (req.url.startsWith('/reports/') || req.url.startsWith('/figma/') || req.url.startsWith('/screenshots/') || req.url.startsWith('/diffs/') || req.url.startsWith('/annotated/')) {
              const filePath = path.join(__dirname, '../output', req.url);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const content = fs.readFileSync(filePath);
                if (req.url.endsWith('.json')) {
                  res.setHeader('Content-Type', 'application/json');
                } else if (req.url.endsWith('.png')) {
                  res.setHeader('Content-Type', 'image/png');
                }
                res.end(content);
                return;
              }
            }
            next();
          });
        };
      },
    },
  ],
  publicDir: '../output',
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
});
