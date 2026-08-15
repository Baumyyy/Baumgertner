FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# Vite inlines import.meta.env.VITE_* at build time, not read at container
# runtime - so this has to arrive as a build arg, not a docker-compose
# `environment:` entry (which would only be visible to the running nginx
# process, too late to matter). See docker-compose.yml.
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]