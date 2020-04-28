FROM node:12-alpine
# Get the necessary build tools
WORKDIR /app
RUN apk update && apk add build-base autoconf automake libtool pkgconfig nasm git
# Add the package.json file and build the node_modules folder
RUN yarn global add gatsby-cli && gatsby telemetry --disable
RUN gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog
COPY ./*.sh .
RUN chmod +x ./entrypoint.sh
CMD ./entrypoint.sh
EXPOSE 80