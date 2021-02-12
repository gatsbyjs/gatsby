FROM node:12.2-alpine As tests

# make target directory for assigning permissions
# RUN mkdir -p /usr/src/gatsby-tests/node_modules
# RUN chown -R node:node /usr/src/gatsby-tests

# use target directory
WORKDIR /usr/gatsby-site

# # set user
# USER node

# copy package*.json separately to prevent re-running npm install with every code change
# COPY package*.json .

# copy the project code (e.g. consider: --only=production)
COPY . .

RUN rm -rf node_modules/sharp

RUN npm install

# expose port 8000
# EXPOSE 8000
