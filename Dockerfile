# Create a standalone instance of GraphiQL populated with gatsbyjs.org's data
# ---
# TODO: Can we do this all on Alpine for a smaller image?
FROM node:8

WORKDIR /usr/src/app
COPY . .
RUN yarn && cd www && yarn && yarn run build

# Set cwd to www so that Gatsby's bootstrap can find www/gatsby-node.js
WORKDIR /usr/src/app/www
CMD [ "node","../scripts/www-data-explorer.js" ]

# To run this image, set the port as an env var with `-e PORT=xxxx` e.g.
# docker run -p 8080:8080 --rm -it -e PORT=8080 <registryUsername>/<imageName>
