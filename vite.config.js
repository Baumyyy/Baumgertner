import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Cloudflare Web Analytics, injected only when a token is configured, the
 * same way VITE_TURNSTILE_SITE_KEY gates the bot check. No token means no
 * tag at all rather than a broken one, so local builds and anyone cloning
 * the repo get a site that simply does not phone home.
 *
 * Chosen over Google Analytics deliberately: it sets no cookies and no
 * persistent identifier, which is what lets the privacy policy keep saying
 * there is no cookie banner because there is nothing to consent to. GA
 * would have cost that sentence, a consent banner and a rewrite of the
 * policy's legal basis. Cloudflare is also already a processor here for
 * Turnstile, so this adds a product rather than a company.
 *
 * The token is not a secret - it ships in the page source by design.
 */
function cloudflareAnalytics(token) {
  return {
    name: 'cloudflare-web-analytics',
    transformIndexHtml() {
      if (!token) return []
      return [{
        tag: 'script',
        attrs: {
          defer: true,
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          'data-cf-beacon': JSON.stringify({ token })
        },
        injectTo: 'body'
      }]
    }
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), cloudflareAnalytics(env.VITE_CF_BEACON_TOKEN)],
    server: {
      // /uploads is gone with the upload routes it proxied to.
      proxy: {
        '/api': 'http://localhost:3001'
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      exclude: ['**/node_modules/**', '**/backend/**']
    }
  }
})
