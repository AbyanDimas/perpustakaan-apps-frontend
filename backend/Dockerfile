# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
# This requires the schema file
RUN npx prisma generate

# Build TypeScript to JavaScript
# Assumes a "build" script in your package.json, e.g., "tsc"
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy package.json for production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma schema for runtime access (needed for migrations)
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose the port the app runs on (e.g., 3000)
EXPOSE 3001

# First, push the schema to the database, then start the server.
# This ensures the database is ready before the app starts.
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
