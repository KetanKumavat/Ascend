# =========================
# Stage 1: Install dependencies
# =========================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile --ignore-scripts; \
    elif [ -f package-lock.json ]; then npm ci --ignore-scripts; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile --ignore-scripts; \
    else echo "Lockfile not found." && exit 1; \
    fi

RUN npx prisma generate

# =========================
# Stage 2: Build Next.js
# =========================
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy only public envs
COPY .env .env

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =========================
# Stage 3: Runner
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/middleware.js ./middleware.js

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
