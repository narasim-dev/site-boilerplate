import 'dotenv/config'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import './prisma'
import { setupGraphqlServer } from './graphqlServer'
import { generateSitemap, SitemapSection } from './sitemap'

const cwd = process.cwd()
const port = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000
const dev = process.env.NODE_ENV !== 'production'
const apiOnly = process.env.API_ONLY === 'true'

async function startServer() {
  // Start GraphQL server with WebSocket support
  const { port: graphqlPort } = await setupGraphqlServer()

  // If API_ONLY mode, we're done
  if (apiOnly) {
    return
  }

  // Otherwise, start full server with Next.js
  const next = (await import('next')).default
  const app = next({ dev })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = express()
  server.set('trust proxy', true)

  // Static files from shared (uploads, not tracked)
  server.use('/shared', express.static(cwd + '/shared'))

  // Proxy /api to GraphQL server (HTTP + WebSocket)
  server.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${graphqlPort}/api`,
      changeOrigin: true,
      ws: false,
    }),
  )

  server.get(Object.values(SitemapSection), (req, res) => {
    return generateSitemap(req, res)
  })

  // Next.js handles everything else
  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Ready on http://localhost:${port}, API at /api`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
