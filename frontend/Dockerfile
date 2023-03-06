# syntax=docker/dockerfile:1

FROM node:14.15.1-alpine3.12
RUN mkdir /app

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm run build

COPY . .

CMD ["npm", "start"]