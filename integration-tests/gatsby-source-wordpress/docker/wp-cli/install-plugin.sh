#!/bin/sh

PLUGIN=$1
REPO=$2
VERSION=$3

if [ -z "$PLUGIN" ]
then
  echo "no plugin supplied"
  exit;
fi

if [ -z "$REPO" ]
then
  echo "no repo supplied"
  exit;
fi

if [ -z "$VERSION" ]
then
  echo "no version supplied"
  exit;
fi

mkdir -p /var/www/html/wp-content/plugins/${PLUGIN} \
    && curl -L https://github.com/${REPO}/archive/${VERSION}.tar.gz \
    | tar xvz -C /var/www/html/wp-content/plugins/${PLUGIN} --strip-components=1
