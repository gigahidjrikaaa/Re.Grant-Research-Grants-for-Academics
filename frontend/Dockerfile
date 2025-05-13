# Stage 1: Build the application
FROM node:slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package.json ./
# Assuming package-lock.json is used with npm, ensure it's committed to your repository
COPY package-lock.json ./

# Install dependencies
# Using npm ci for cleaner installs, ensure package-lock.json is up-to-date
RUN npm ci

# Copy the rest of the application code
COPY . .

# Environment variables for Next.js build
# These will be passed as build arguments from docker-compose.yml
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_XELLAR_APP_ID
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}
ENV NEXT_PUBLIC_XELLAR_APP_ID=${NEXT_PUBLIC_XELLAR_APP_ID}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application
RUN npm run build

# Stage 2: Production image
FROM node:slim

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# If you have a custom server.js, copy it as well.
# COPY --from=builder /app/server.js ./server.js

# Copy node_modules from the builder stage.
# For a smaller image, consider Next.js standalone output feature.
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Set the command to start the application
CMD ["npm", "start"]