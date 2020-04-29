FROM node:12-alpine
# Get the necessary build tools
WORKDIR /app
RUN apk update && apk add build-base autoconf automake libtool pkgconfig nasm git
# Add the package.json file and build the node_modules folder
RUN yarn global add gatsby-cli && gatsby telemetry --disable
RUN gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog
CMD ["/bin/ash", "-c", "cd blog && gatsby develop -H 0.0.0.0 -p 80"]
EXPOSE 80