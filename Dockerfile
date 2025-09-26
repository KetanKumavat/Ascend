# =========================
# Stage 1: Install dependencies
# =========================
FROM node:18-alpine AS deps

# Install system deps for Prisma
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lockfiles & package.json
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile --ignore-scripts; \
    elif [ -f package-lock.json ]; then npm ci --ignore-scripts; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile --ignore-scripts; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Generate Prisma client
RUN npx prisma generate

# =========================
# Stage 2: Build Next.js
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source code including middleware
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN npm run build

# ------------------------
# Stage 3: Runner / Production
# ------------------------
FROM node:18-alpine AS runner
WORKDIR /app

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

# Copy public folder and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy middleware.js for Clerk detection
COPY --from=builder /app/middleware.js ./middleware.js

# Switch to non-root user
USER nextjs

# Expose Cloud Run port
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]