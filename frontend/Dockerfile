# syntax=docker/dockerfile:1

FROM node:20.1-alpine3.16 as build
RUN mkdir /app

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
# RUN REACT_APP_API_URL=https://myxdj.org/api npm run build
RUN REACT_APP_API_URL=http://myx.localhost/api npm run build

FROM nginx:latest

RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]