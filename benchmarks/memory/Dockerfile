FROM node:14-buster
ENV NODE_ENV=production
RUN apt-get update -y && apt-get upgrade -y && apt-get install git curl npm -y
RUN npm i -g gatsby-dev-cli
WORKDIR /usr/src/app

CMD ["yarn", "start"]
