FROM node:22

WORKDIR /work
COPY api .
COPY db .
COPY views .
COPY index.js .
COPY package.json .

RUN npm install --frozen-lockfile

ENTRYPOINT [ "/usr/local/bin/node" ]
CMD [ "./index.js" ]
