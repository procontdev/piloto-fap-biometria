# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Argumento para la URL del API (VITE_API_URL)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS final
WORKDIR /usr/share/nginx/html

# Copiar archivos compilados
COPY --from=build /app/dist .

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
