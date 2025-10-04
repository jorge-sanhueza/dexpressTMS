FROM node:22-alpine as build

WORKDIR /app

# Copy the entire project
COPY ../../ ./

# Install dependencies
RUN npm install

# Build using the specific script path
RUN npm run build:web

# Production stage
FROM nginx:alpine

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]