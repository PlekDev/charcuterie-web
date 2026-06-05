# Imagen de producción para la app Next.js (output: 'standalone').
# Basado en el ejemplo oficial vercel/next.js with-docker, adaptado para
# inyectar las vars NEXT_PUBLIC_* en build (Next las inlinea en el bundle).

ARG NODE_VERSION=22-slim


# Stage 1: dependencias
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund


# Stage 2: build
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las NEXT_PUBLIC_* se inlinean en el bundle del browser EN BUILD -> hay que
# pasarlas como build args. Son públicas por diseño (no secrets).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NODE_ENV=production

RUN npm run build


# Stage 3: runtime
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir .next && chown node:node .next

# El standalone trae su propio server.js minimal + el node_modules necesario.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# OJO: este server.js es el de Next standalone (/app/server.js), NO src/server.js.
CMD ["node", "server.js"]
