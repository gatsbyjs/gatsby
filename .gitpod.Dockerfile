FROM gitpod/workspace-full

RUN bash -c 'NODE_VERSION="18" \
  && source $HOME/.nvm/nvm.sh && nvm install $NODE_VERSION \
  && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION'

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

RUN npm -g install gatsby-dev-cli
