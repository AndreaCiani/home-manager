# --- Stage 1: build the Angular app ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# The output folder name may vary depending on the Angular version
# (usually dist/frontend/browser). It will be aligned at real build time.
RUN npm run build

# --- Stage 2: serving with Nginx ---
FROM nginx:alpine
# Custom config (static + /api proxy + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static files produced by the build
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
