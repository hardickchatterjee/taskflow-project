# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build-time environment variables
ARG DATABASE_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG GEMINI_API_KEY
ARG GEMINI_API_URL

# Set them so Next.js build can access
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV GEMINI_API_URL=$GEMINI_API_URL

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Runtime environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV GEMINI_API_URL=$GEMINI_API_URL

COPY --from=builder /app/ ./
EXPOSE 3000
CMD ["npm", "start"]
