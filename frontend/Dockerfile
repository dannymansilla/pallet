# frontend/Dockerfile

# Stage 1: Build React app
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy build output to NGINX's public directory
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Remove default NGINX config (we'll mount our own)
RUN rm /etc/nginx/conf.d/default.conf

# NGINX will listen on 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
