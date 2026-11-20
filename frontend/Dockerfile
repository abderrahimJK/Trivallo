# Build stage: install dependencies and build both locales (/en and /fr) plus the SSR server.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: only the build output, running as the non-root "node" user.
FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/trivallo ./dist/trivallo
USER node
EXPOSE 4000
CMD ["node", "dist/trivallo/server/server.mjs"]
