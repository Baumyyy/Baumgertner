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