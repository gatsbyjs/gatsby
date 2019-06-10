FROM node:10-slim

LABEL com.github.actions.name="gatsby-site-showcase-validator"
LABEL com.github.actions.description="Check Gatsby's Site Showcase to validate all sites are built with Gatsby"
LABEL com.github.actions.icon="monitor"
LABEL com.github.actions.color="purple"

# Copy the action's code into the container
COPY . .

# Install dependencies
RUN yarn

# Start node app
ENTRYPOINT [ "node", "/index.js" ]
