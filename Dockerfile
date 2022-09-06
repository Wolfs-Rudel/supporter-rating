FROM node:17.7.2

# create dir
RUN mkdir -p /usr/src/eazyautodelete

WORKDIR /usr/src/eazyautodelete

# copy bot
COPY . ./

# install dependencies
RUN npm install

# build
RUN npm run build

# start bot
CMD ["node", "."]