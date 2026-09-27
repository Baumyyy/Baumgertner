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

/**
 * Preloads the one font the hero headline is set in.
 *
 * Measured on the live site, throttled to a mid-tier phone on Slow 4G:
 * LCP is the headline itself (span.hero-claim-line) and it landed
 * anywhere between 1.9s and 4.3s across three runs. The spread is the
 * font arriving late, not the page being heavy - on desktop the same
 * element paints at 664ms.
 *
 * The cause is discovery order. @font-face lives in the built stylesheet,
 * so the browser cannot know the font exists until it has fetched and
 * parsed that stylesheet; only then does it start the font. One preload
 * in the head moves that request to the front and lets it run alongside
 * the CSS instead of behind it.
 *
 * Only the display 700 is preloaded, deliberately. Every preload competes
 * for the same bandwidth, and this is the weight the measurement named -
 * preloading the body text as well would slow down the thing being fixed.
 *
 * The filename is read from the bundle rather than written here because
 * Vite hashes it; hardcoding the hash would survive exactly one build.
 */
function naytonFontinEsilataus() {
  return {
    name: 'display-font-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx || !ctx.bundle) return []
      const tiedosto = Object.keys(ctx.bundle).find(function (nimi) {
        return /orbitron-latin-700-normal-[^/]*\.woff2$/.test(nimi)
      })
      // No match means fontsource renamed its files and this quietly does
      // nothing - which is what src/tests/fontpreload.test.js watches for.
      if (!tiedosto) return []
      return [{
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
          href: '/' + tiedosto
        },
        injectTo: 'head-prepend'
      }]
    }
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), cloudflareAnalytics(env.VITE_CF_BEACON_TOKEN), naytonFontinEsilataus()],
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
