FROM node:10-alpine

ARG GATSBY_MODE=develop
ARG HOST=localhost
ARG PORT=8000
ENV GATSBY_MODE=$GATSBY_MODE
ENV HOST=$HOST
ENV PORT=$PORT

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn

CMD ["sh", "-c", "yarn ${GATSBY_MODE} -H ${HOST} -p ${PORT}"]