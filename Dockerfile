FROM node:16-alpine AS build

WORKDIR /build

# Copy npm and yarn files to /tmp
COPY package*.json ./
COPY yarn.lock ./

# Install libs
RUN set -xe && \
  npm i -yarn && \
  yarn install

# Copy source files
COPY ./src ./src
COPY ./assets ./assets

# Run build
RUN set -xe && \
  yarn run build

# Final image
# --------------------------------------
FROM node:16-alpine AS runtime-image
WORKDIR /app

COPY --from=build --chown=nobody:nobody /build /app
RUN set -xe && \
  chown nobody:nobody /app
USER nobody

CMD ["yarn", "start"]