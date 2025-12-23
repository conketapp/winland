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

# Verify dependencies are available
RUN cd apps/ctv-portal && npm list @radix-ui/react-dialog || npm install @radix-ui/react-dialog --legacy-peer-deps

# Generate Prisma Client
WORKDIR /app/apps/ctv-portal
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

