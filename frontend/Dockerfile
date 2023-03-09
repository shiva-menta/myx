# syntax=docker/dockerfile:1

FROM node:14.15.1-alpine3.12
RUN mkdir /app

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

RUN npm run build

FROM nginx:latest
COPY --from=0 /app/build /usr/share/nginx/html