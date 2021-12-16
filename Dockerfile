# This project is built by MeteorJS 1.4.2.7, which bundles Node.js 4.4.7. The
# most recent and compatible Node.js image, as of writing, was picked to provide
# the most compoatible build tooling for `meteor npm install'.
FROM node:4.9.1-stretch as sapporo-builder
ENV METEOR_ALLOW_SUPERUSER=1

# Install MeteorJS 1.4.2.7
RUN curl -sk https://install.meteor.com/?release=1.4.2.7 | sh

RUN mkdir /source
WORKDIR /source

# Copy over `package.json' and install NPM deppendencies...
COPY package.json .
RUN meteor npm install && \
    meteor npm cache clean --force

# Copy over EVERYTHING BUT `package.json', run the meteor build, and populate
# the server-side runtime...
COPY .meteor ./.meteor/
COPY client ./client/
COPY imports ./imports/
COPY public ./public/
COPY server ./server/
RUN mkdir /output && \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    meteor build /output --directory && \
    cd /output/bundle/programs/server && \
    npm install && \
    npm cache clean --force

# Same version of Node.js image, but the "slim" variant, is used for
# accomodating sapporo. The image is much smaller because it carries no build
# tooling, which we don't need for just running the app.
FROM node:4.9.1-slim as sapporo-app

RUN mkdir /sapporo
WORKDIR /sapporo
COPY --from=sapporo-builder /output .

CMD ["/usr/local/bin/node", "bundle/main.js"]
