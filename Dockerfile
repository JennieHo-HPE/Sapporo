# This project is currently built against MeteorJS 1.4.2.7, which bundles
# Node.js 4.4.7. The most recent and compatible Node.js image was picked to
# provide the most compoatible build tooling for `meteor npm install'.
FROM node:4.9.1-stretch as builder
ENV SAPPORO_VERSION 0.1.0

# Install MeteorJS 1.4.2.7
ENV METEOR_ALLOW_SUPERUSER=1
RUN curl -k https://install.meteor.com/?release=1.4.2.7 | sh

RUN mkdir /source
WORKDIR /source

# Copy over `package.json' and install meteor frontend dependencies...
COPY package.json .
RUN meteor npm install

# Then we run the meteor build...
COPY . .
RUN mkdir /output
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 meteor build /output

# Same version of Node.js image as the one we use for meteor build, but the
# "slim" variant, which suffices for app running.
FROM node:4.9.1-slim
COPY --from=builder /output/source.tar.gz /sapporo.tar.gz

# Extract the built tarball and install backend dependencies...
RUN mkdir /sapporo && \
    cd /sapporo && \
    tar xf /sapporo.tar.gz && \
    cd /sapporo/bundle/programs/server && \
    npm install

CMD ["/usr/local/bin/node", "/sapporo/bundle/main.js"]
