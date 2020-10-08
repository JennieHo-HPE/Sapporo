FROM node:5.0
MAINTAINER Daniel Schaefer <daniel.schaefer@hpe.com>
ENV SAPPORO_VERSION 0.1.0

# Install old version of MeteorJS
ENV METEOR_ALLOW_SUPERUSER=1
RUN curl https://install.meteor.com/?release=1.4.2.6 | sh

RUN mkdir /source
WORKDIR /source

# Copy package.json only and install dependencies, so this step can be cached
# if we don't update the dependencies
COPY package.json .
RUN npm install

# Build meteor into /output
COPY . .
RUN mkdir /output
RUN meteor build /output

# Use clean image which only includes our bundle and no dev dependencies
FROM node:4.6
COPY --from=0 /output/source.tar.gz /sapporo.tar.gz
RUN mkdir /sapporo
RUN cd /sapporo && tar xf /sapporo.tar.gz


#RUN apt-get update
#RUN apt-get -y install build-essential
RUN cd /sapporo/bundle/programs/server && npm install

CMD ["/usr/local/bin/node", "/sapporo/bundle/main.js"]
