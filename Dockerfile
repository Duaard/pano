# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build


# ---- Production Stage ----
FROM node:22-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy server source
COPY server ./server
COPY tsconfig.json tsconfig.node.json ./

ENV NODE_ENV=production
EXPOSE 3800

# Data directory for agent sessions (mount as volume at runtime)
VOLUME ["/data/agents"]

CMD ["npx", "tsx", "server/index.ts"]
