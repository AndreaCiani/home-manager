# --- Stage 1: build dell'app Angular ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Il nome della cartella di output può variare in base alla versione di Angular
# (di solito dist/frontend/browser). Verrà allineato al momento del build reale.
RUN npm run build

# --- Stage 2: servizio con Nginx ---
FROM nginx:alpine
# Config personalizzata (static + proxy /api + fallback SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# File statici prodotti dal build
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
