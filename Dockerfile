# Stage 1: Install production dependencies
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Stage 2: Build application
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application (compiles migrate.ts and server.ts to dist/)
RUN bun run build

# Stage 3: Production runtime
FROM oven/bun:1-slim AS production
WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Copy migrations folder (required by migrate.js)
COPY drizzle ./drizzle

# Copy package.json for metadata
COPY package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333

# Expose application port
EXPOSE 3333

# Healthcheck to ensure the container is healthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3333').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run migrations then start server
CMD ["sh", "-c", "bun dist/migrate.js && bun dist/server.js"]
