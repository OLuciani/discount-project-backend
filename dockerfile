FROM node:21-bullseye

WORKDIR /server  

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5050

CMD [ "npm","start" ]
