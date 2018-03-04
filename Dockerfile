# Create a standalone instance of GraphiQL populated with gatsbyjs.org's data
# ---
# libvips needed for image manipulation
FROM marcbachmann/libvips:8.4.1 as build

# Node.js version 8 and build tools for sharp
RUN apt-get update && apt-get install -y build-essential g++ curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

RUN npm install -g yarn@1.3.2

WORKDIR /usr/src/app

COPY . .
RUN yarn && cd www && yarn
RUN cd www && yarn run build

# Start again and just copy across the built files (+ node_modules)
# TODO: Can we do this all on Alpine for a much smaller image? This node:8 image is ~600MB
FROM node:8 as dist

COPY --from=build /usr/src/app /usr/src/app

# Set cwd to www so that Gatsby's bootstrap can find www/gatsby-node.js
WORKDIR /usr/src/app/www
CMD [ "node","../scripts/www-data-explorer.js" ]

# To run this image, set the port as an env var with `-e PORT=xxxx` e.g.
# docker run -p 8080:8080 --rm -it -e PORT=8080 <registryUsername>/<imageName>
