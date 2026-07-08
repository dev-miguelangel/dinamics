# ---- Build Angular app ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Install server (production) dependencies ----
FROM node:22-alpine AS server-deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev

# ---- Runtime image ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY server/index.js ./server/index.js
COPY --from=server-deps /app/node_modules ./server/node_modules
COPY --from=build /app/dist/dinamicas/browser ./dist/dinamicas/browser

EXPOSE 3001
ENV PORT=3001

CMD ["node", "server/index.js"]
