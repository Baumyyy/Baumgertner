# Stock caddy:2-alpine has no DNS provider plugins, only HTTP-01/TLS-ALPN-01
# challenges - both require the domain to resolve directly to this server,
# which breaks the moment Cloudflare proxying (orange cloud) is turned on,
# since those challenges then hit Cloudflare's edge instead of this origin.
# DNS-01 (via the cloudflare plugin below) proves domain ownership by
# creating a DNS TXT record through Cloudflare's API instead, so it works
# identically whether the domain is proxied or DNS-only.
FROM caddy:2-builder-alpine AS builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
