FROM node:14-buster
ARG jemalloc
ENV CI=1
ENV GATSBY_CPU_COUNT=4
RUN apt-get update -y && apt-get upgrade -y && apt-get install git curl npm -y
RUN npm i -g gatsby-cli gatsby-dev-cli

# set heap to 16gb just to catch all test cases
ENV NODE_OPTIONS="--max-old-space-size=16368"

RUN echo "\n\necho \"Welcome to the Gatsby benchmark container!\\n  - /usr/src/gatsby : Your local gatsby repo\\n  - /usr/src/app : The benchmark gatsby site\\n\"" > /root/.bashrc

RUN if [ "$jemalloc" = "1" ]; then \
  echo "Using jemalloc for memory allocation" && \
  apt-get update && apt-get install -y libjemalloc-dev=5.1.0-3 && \
  echo "/usr/lib/x86_64-linux-gnu/libjemalloc.so" >> /etc/ld.so.preload && \
  echo "\n\necho \"This container is using jemelloc.\\n\"" >> /root/.bashrc; \
fi


WORKDIR /usr/src/app

# set up gatsby-dev
RUN gatsby-dev --set-path-to-repo /usr/src/gatsby

# keep the process running
ENTRYPOINT ["tail", "-f", "/dev/null"]