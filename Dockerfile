FROM node:18-slim

# Install Chromium + dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates fonts-liberation libasound2 \
    libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdbus-1-3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libnss3 libnspr4 wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Skip puppeteer’s built-in Chrome download
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Important: point Puppeteer-Core to system chromium
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 10000

CMD ["node", "index.js"]
