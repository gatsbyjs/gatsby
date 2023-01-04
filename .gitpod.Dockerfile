FROM gitpod/workspace-full

ADD .nvmrc .
RUN bash -c 'source $HOME/.nvm/nvm.sh && nvm install && nvm use'

RUN echo "nvm use &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

RUN npm -g install gatsby-dev-cli
