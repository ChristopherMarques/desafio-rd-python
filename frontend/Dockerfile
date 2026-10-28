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

# Configuração do Nginx com suporte a SPA, DNS dinâmico e Proxy reverso para o backend FastAPI
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    resolver 127.0.0.11 valid=30s ipv6=off; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /probes { \
        set $backend_upstream http://backend:8000; \
        proxy_pass $backend_upstream; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /api/ { \
        set $backend_upstream http://backend:8000; \
        proxy_pass $backend_upstream; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /health { \
        set $backend_upstream http://backend:8000; \
        proxy_pass $backend_upstream; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
