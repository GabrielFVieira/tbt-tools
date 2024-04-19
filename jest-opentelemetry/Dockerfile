FROM node:20.9.0-alpine

WORKDIR /app

COPY ./ ./
RUN npm ci

EXPOSE 4123

ENTRYPOINT npm run test:k8s
