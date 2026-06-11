# ── Build stage ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Build-time public config (Vite inlines VITE_* at build time).
# On Zeabur/other hosts, pass these as build args or env vars.
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_ACCESS_CODE
ARG VITE_BOT_NAME
ARG VITE_AGENCY_NAME
ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL \
    VITE_ACCESS_CODE=$VITE_ACCESS_CODE \
    VITE_BOT_NAME=$VITE_BOT_NAME \
    VITE_AGENCY_NAME=$VITE_AGENCY_NAME

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Serve stage ────────────────────────────────────────────────
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
