FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

# data/ und uploads/ werden per Volume vom Host eingebunden, siehe docker-compose.yml
RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "src/index.js"]
