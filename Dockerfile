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
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"
ENV NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
ENV GEMINI_API_KEY="AIzaSyB6eNILabOMWhs5bSJJeBXn_YSyyUrUK-Q"
ENV GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key"

COPY --from=builder /app/ ./
EXPOSE 3000
CMD ["npm", "start"]
