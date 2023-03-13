FROM node:16-slim AS build

WORKDIR /build

# Copy npm and yarn files to /tmp
COPY package*.json ./
COPY yarn.lock ./

# Install libs
RUN set -xe && \
  yarn install

# Copy source files
COPY . .

# Run build
RUN set -xe && \
  yarn run build

# Final image
# --------------------------------------
FROM node:16-slim AS runtime-image
WORKDIR /app

# Puppeteer libraries
RUN apt-get update && \
    apt-get install -yq ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
    libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \ 
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

COPY --from=build /build /app

CMD ["yarn", "start"]