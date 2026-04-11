import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { analyzeWebsiteFromUrl } from './lib/analyze-website.js'

function analyzerApiPlugin() {
  return {
    name: 'analyzer-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed.' }))
          return
        }

        try {
          const requestUrl = new URL(req.originalUrl || req.url || '', 'http://localhost')
          const url = requestUrl.searchParams.get('url')

          if (!url) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing url query parameter.' }))
            return
          }

          const analysis = await analyzeWebsiteFromUrl(url)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(analysis))
        } catch (error) {
          res.statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error?.message || 'We could not analyze that website right now.',
            })
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), analyzerApiPlugin()],
})
