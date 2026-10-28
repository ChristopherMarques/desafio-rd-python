# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json ./
RUN pnpm config set ignore-scripts false && \
    pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx com suporte a SPA e Proxy reverso para o backend FastAPI
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /probes { \
        proxy_pass http://backend:8000/probes; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /api/ { \
        proxy_pass http://backend:8000/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /health { \
        proxy_pass http://backend:8000/health; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
