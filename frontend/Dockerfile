# syntax=docker/dockerfile:1

FROM node:14.15.1-alpine3.12 as build
RUN mkdir /app

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN REACT_APP_API_URL=http://myx.localhost:8080/api npm run build

FROM nginx:latest

RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]