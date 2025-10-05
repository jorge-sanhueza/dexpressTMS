FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy API source code
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Build the app
RUN npm run build --workspace=apps/api

EXPOSE 3000

CMD ["node", "dist/src/main.js"]