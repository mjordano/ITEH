# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiranje package fajlova
COPY package*.json ./

# Instaliranje zavisnosti
RUN npm install

# Kopiranje source koda
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Kopiranje nginx konfiguracije
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiranje build fajlova
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
