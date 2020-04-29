FROM node:12-alpine

WORKDIR /app
RUN apk update && \
    apk add build-base autoconf automake libtool pkgconfig nasm git && \
    yarn global add gatsby-cli && \
    gatsby telemetry --disable && \
    gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog

CMD ["/bin/ash", "-c", "cd blog && gatsby develop -H 0.0.0.0 -p 80"]
