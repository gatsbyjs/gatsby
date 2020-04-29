FROM node:12

WORKDIR /app
COPY . .
RUN npm install -g gatsby-cli && \
    gatsby new my-blog-starter https://github.com/gatsbyjs/gatsby-starter-blog

CMD ["/bin/bash", "-c", "cd my-blog-starter/ && gatsby develop -H 0.0.0.0 -p 80"]
