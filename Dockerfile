# Build stage
FROM node:20-alpine as build

# 環境変数の設定
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:gcp

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 