# ---- Base Node ----
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Dependencies ----
# Install all dependencies, including devDependencies, for development and building
FROM base AS deps
RUN npm install

# ---- Builder ----
# Build the application
FROM deps AS builder
COPY . .
RUN npm run build

# ---- Production ----
# Final stage for production: copies only necessary artifacts
FROM base AS production
ENV NODE_ENV=production
# Install only production dependencies.
# Ensure package-lock.json is present by copying it again.
COPY package*.json ./
RUN npm ci --only=production
# If you face issues with `npm ci`, you can fall back to `npm install --only=production --no-package-lock`
# or ensure your `package-lock.json` is perfectly in sync.

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
# The default port for NestJS is 3000. Change if your app uses a different one.
# If your main.ts explicitly listens on process.env.PORT, ensure it's set.

CMD ["node", "dist/main.js"]
