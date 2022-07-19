FROM arsenal-services-base-image

# FROM node:16-alpine
# RUN apk add g++ make python2d

WORKDIR /service

COPY package.json ./

RUN mkdir /db

# /src will be a mapped volume for development
#COPY ./src ./src

RUN npm install --verbose

CMD ["npm", "run", "start"]
