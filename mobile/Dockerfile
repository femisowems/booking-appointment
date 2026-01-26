# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# For Ionic Angular, usually 'ng build' or 'ionic build' creates the www folder.
# package.json has "build": "ng build" which outputs to 'www' (confirmed in angular.json)
RUN npm run build -- --configuration=production

# Production Stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/www /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
