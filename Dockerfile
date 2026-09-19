FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# `npm run build` ends with scripts/prerender.js, which opens every route
# in Chromium and writes it out as real HTML so crawlers that do not run
# JavaScript can read the site. Chromium only, and --with-deps pulls the
# system libraries Debian slim leaves out.
RUN npx playwright install --with-deps chromium

COPY . .
# Vite inlines import.meta.env.VITE_* at build time, not read at container
# runtime - so this has to arrive as a build arg, not a docker-compose
# `environment:` entry (which would only be visible to the running nginx
# process, too late to matter). See docker-compose.yml.
#
# `docker build` warns SecretsUsedInArgOrEnv on both of these because of
# the words "key" and "token". Neither is a secret: a Turnstile *site* key
# and a Web Analytics beacon token are both served to every visitor in the
# page source by design - their private counterparts are TURNSTILE_SECRET
# in the backend and nothing at all, respectively. The warning is correct
# as a general rule and wrong here; do not "fix" it by moving these to a
# runtime env var, because Vite has already inlined them by then and the
# features would silently stop working.
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
ARG VITE_CF_BEACON_TOKEN
ENV VITE_CF_BEACON_TOKEN=$VITE_CF_BEACON_TOKEN
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]