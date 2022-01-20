FROM node:14.17.6 as build

RUN npx pkg-fetch@3.2.3 node14 linux x64

FROM debian:buster
ENV NODE_ENV=production

RUN apt-get update && apt-get upgrade && apt-get install git curl npm -y

# RUN echo "Install packages" && \
#   apt-get update && \
#   DEBIAN_FRONTEND=noninteractive \
#   # apt-get upgrade installs foo AND upgrades packages in one step
#   apt-get upgrade --yes --no-install-recommends \
#   # FROM buildpack-deps:buster-curl
#   ca-certificates \
#   curl \
#   dirmngr \
#   gnupg \
#   netbase \
#   wget \
#   # FROM buildpack-deps:buster-scm
#   git \
#   # mercurial \
#   # openssh-client \
#   # subversion \
#   procps \
#   # FROM buildpack-deps:buster
#   autoconf \
#   automake \
#   bzip2 \
#   default-libmysqlclient-dev \
#   dpkg-dev \
#   file \
#   g++ \
#   gcc \
#   imagemagick \
#   libbz2-dev \
#   libc6-dev \
#   libcurl4-openssl-dev \
#   libdb-dev \
#   libevent-dev \
#   libffi-dev \
#   libgdbm-dev \
#   libglib2.0-dev \
#   libgmp-dev \
#   libjpeg-dev \
#   libkrb5-dev \
#   liblzma-dev \
#   libmagickcore-dev \
#   libmagickwand-dev \
#   libmaxminddb-dev \
#   libncurses5-dev \
#   libncursesw5-dev \
#   libpng-dev \
#   libpq-dev \
#   libreadline-dev \
#   libsqlite3-dev \
#   libssl-dev \
#   libtool \
#   libwebp-dev \
#   libxml2-dev \
#   libxslt-dev \
#   libyaml-dev \
#   make \
#   patch \
#   unzip \
#   xz-utils \
#   zlib1g-dev \
#   ########################
#   # Gatsby added packages
#   # Should leave/include packages that make compiling node C/C++ extensions possible/easier/faster
#   # A bunch of these packages are probably unnecessary since we no longer compile libvips here
#   build-essential \
#   cdbs \
#   debhelper \
#   dh-autoreconf \
#   fftw3-dev \
#   flex \
#   bison \
#   gettext \
#   gtk-doc-tools \
#   libcfitsio-dev \
#   libexif-gtk-dev \
#   libfontconfig1-dev \
#   libfreetype6-dev \
#   libgif-dev \
#   libgirepository1.0-dev \
#   libgsf-1-dev \
#   libice-dev \
#   liblcms2-dev \
#   libmatio-dev \
#   libopenexr-dev \
#   libopenslide-dev \
#   liborc-0.4-dev \
#   libpango1.0-dev \
#   libpoppler-glib-dev \
#   librsvg2-dev \
#   libtiff-dev \
#   libxml-parser-perl \
#   pkg-config \
#   git-lfs \
#   # These make installation of cwebp-bin faster by about 30s. gatsby-plugin-sharp -> imagemin-webp -> cwebp-bin
#   libgl1-mesa-dev \
#   liblz4-tool \
#   # tooling for cloud team
#   ack \
#   curl \
#   dnsutils \
#   htop \
#   less \
#   lsof \
#   ncdu \
#   tig \
#   vim \
#   && \
#   apt-get clean && \
#   rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV YARN_VERSION 1.22.5

RUN echo "Install NVM" && \
  # clone nvm
  git clone --quiet --depth=1 https://github.com/nvm-sh/nvm.git --branch=v0.35.0 /root/.nvm && \
  # Add here any versions we expect to be popular, and want to be cached
  # "node" is the latest version
  # Also install npm, yarn and lerna under that version of node
  #nvm install   10 && nvm exec   10 npm install -g npm@^6.14 yarn@^1.22 lerna@${GATSBY_DEFAULT_LERNA_VERSION} && \
  #nvm install   12 && nvm exec   12 npm install -g npm@^6.14 yarn@^1.22 lerna@${GATSBY_DEFAULT_LERNA_VERSION} && \
  /root/.nvm/nvm.sh install   14 && nvm exec   14 npm install -g npm@^6.14 yarn@^1.22 lerna@${GATSBY_DEFAULT_LERNA_VERSION} && \
  /root/.nvm/nvm.sh alias default 14 && \
  /root/.nvm/nvm.sh ls && \
  /usr/local/bin/nvm ls

RUN npm i -g gatsby-dev-cli yarn@^1.22

WORKDIR /usr/src/app

CMD ["yarn", "start"]
