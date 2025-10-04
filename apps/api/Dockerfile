FROM node:22-alpine

WORKDIR /app

# Copy everything from the API directory
COPY . .

# Use npm install instead of npm ci (more forgiving with lock files)
RUN npm install

# Build the app
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]