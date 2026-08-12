FROM node:22-alpine AS build

WORKDIR /app

COPY client/package.json client/package-lock.json* ./
RUN npm install

COPY client/. .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
