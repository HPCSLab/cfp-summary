FROM node:22

WORKDIR /work
COPY api api
COPY db db
COPY views views
COPY index.js index.js
COPY package.json package.json

RUN npm install --frozen-lockfile

