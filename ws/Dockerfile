FROM node:alpine3.19

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci
COPY ./server.js ./callback.js ./utils.js ./

EXPOSE 8080

CMD ["npm", "start"]