FROM node:8
RUN npm install -g yarn@1.3.2
RUN yarn global add gatsby-cli gatsby-dev-cli
RUN mkdir ~/.ssh && echo -e "Host github.com\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
RUN git clone https://github.com/gatsbyjs/gatsby.git
RUN wget https://github.com/github/hub/releases/download/v2.3.0-pre10/hub-linux-amd64-2.3.0-pre10.tgz --directory-prefix /usr/local/bin
RUN cd gatsby && gatsby-dev --set-path-to-repo . && yarn bootstrap
RUN mkdir -p gatsby/infrastructure
COPY package.json gatsby/infrastructure/
COPY yarn.lock gatsby/infrastructure/
RUN cd gatsby/infrastructure && yarn
COPY build-site.js gatsby/infrastructure/
CMD ["node", "gatsby/infrastructure/build-site.js"]
