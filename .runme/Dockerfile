FROM node:12

WORKDIR /app
RUN npm install -g gatsby-cli && \
    gatsby telemetry --disable && \
    gatsby new my-blog-starter https://github.com/gatsbyjs/gatsby-starter-blog

CMD ["/bin/bash", "-c", "cd my-blog-starter/ && gatsby develop -H 0.0.0.0 -p 80"]
