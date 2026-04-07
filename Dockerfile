FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
