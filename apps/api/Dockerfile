FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/prisma ./apps/api/prisma

RUN npm ci --no-audit --no-fund --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app

# Dummy DATABASE_URL for Prisma generate (doesn't actually connect)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

RUN cd apps/api && npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
