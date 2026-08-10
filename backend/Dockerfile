FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 3001
CMD ["node", "server.js"]
