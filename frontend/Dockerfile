# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Installation de toutes les dependances (prod + dev) pour le build
COPY package*.json ./
RUN npm ci

# Copie et build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copie de l'output du build
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Installation des seules dependances de production
COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
