# ============ PHASE 1: BUILD ============

# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app
RUN npm run build

# ============ PHASE 2: PRODUCTION ============
# Use a lightweight web server to serve the built app
FROM nginx:alpine

# We copy the built app from the builder stage to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]