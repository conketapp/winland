# CTV Portal Dockerfile (Next.js)
# Next.js 16 requires Node.js >= 20.9.0
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files for monorepo
COPY package.json package-lock.json ./
COPY apps/ctv-portal/package.json ./apps/ctv-portal/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (monorepo hoisting)
RUN npm install --legacy-peer-deps

# Build the application
FROM base AS builder
WORKDIR /app

# Copy all dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ctv-portal/node_modules ./apps/ctv-portal/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY package.json package-lock.json ./
COPY apps/ctv-portal ./apps/ctv-portal
COPY packages/shared ./packages/shared

# Ensure react and react-dom are available in workspace
# Next.js needs these in the workspace node_modules or accessible from parent
WORKDIR /app/apps/ctv-portal

# Create node_modules if it doesn't exist and install critical dependencies
RUN mkdir -p node_modules && \
    if [ ! -d "node_modules/react" ]; then \
        npm install react@19.1.0 react-dom@19.1.0 --save --legacy-peer-deps; \
    fi

# Verify react is available
RUN test -d node_modules/react || (echo "React not found, installing..." && npm install react react-dom --save --legacy-peer-deps)

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/apps/ctv-portal/.next/standalone ./
COPY --from=builder /app/apps/ctv-portal/.next/static ./apps/ctv-portal/.next/static
COPY --from=builder /app/apps/ctv-portal/public ./apps/ctv-portal/public
COPY --from=builder /app/apps/ctv-portal/package*.json ./apps/ctv-portal/
COPY --from=builder /app/apps/ctv-portal/prisma ./apps/ctv-portal/prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/ctv-portal

CMD ["node", "server.js"]

