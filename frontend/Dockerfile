FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev && npm install jose

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]