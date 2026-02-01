FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
# Use absolute path so next-intl resolves correctly when workspace scripts run with cwd=/app/apps/web
ENV NEXT_INTL_CONFIG_PATH=/app/apps/web/next-intl.config.ts

# Build-time args for NEXT_PUBLIC_* variables (required for client-side code)
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

RUN npm run build:web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_INTL_CONFIG_PATH=/app/apps/web/next-intl.config.ts

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder /app/apps/web/next-intl.config.ts ./apps/web/next-intl.config.ts
COPY --from=builder /app/next-intl.config.ts ./next-intl.config.ts

EXPOSE 3000
CMD ["npm", "run", "-w", "@kinder/web", "start"]
