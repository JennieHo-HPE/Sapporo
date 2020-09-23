FROM node:5.0

COPY . .
RUN curl https://install.meteor.com/ | sh
RUN meteor build ./
