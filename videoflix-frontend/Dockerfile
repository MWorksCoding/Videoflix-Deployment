# ---------- Stage 1: build the Angular app ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies from the lockfile first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .

# Which Angular configuration to build:
#   development -> baseUrl http://127.0.0.1:8000  (local docker testing)
#   production  -> baseUrl https://videoflix-server.marius-katzer.com (your server)
ARG CONFIGURATION=production
RUN npm run build -- --configuration=${CONFIGURATION}

# ---------- Stage 2: serve the static build with nginx ----------
FROM nginx:1.27-alpine

# SPA-aware nginx config (deep links fall back to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The Angular "application" builder emits into dist/<project>/browser
COPY --from=build /app/dist/videoflix-frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
