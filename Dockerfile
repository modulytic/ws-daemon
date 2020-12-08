FROM node:current-buster-slim
LABEL maintainer="Noah Sandman <noah@modulytic.com>"

## Prepare for any installation
RUN apt-get update && apt-get -y upgrade

ENV WSDAEMON_PREFIX="/usr/src/app"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY src ./src

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

RUN mkdir ./scripts
RUN touch ./config.json

COPY docker/run.sh ./run.sh
RUN chmod +x ./run.sh

RUN touch ./setup.sh

ENTRYPOINT ["./run.sh"]
