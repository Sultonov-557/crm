FROM node:20-slim

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY .env.prod ./.env
COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "run", "prod"]
