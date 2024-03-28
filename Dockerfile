FROM node:21
WORKDIR /app
COPY package*.json /app/
COPY .env /app/

COPY . /app

RUN npm install

EXPOSE 8888

ENTRYPOINT ["npm", "start"]