#!/bin/bash

if [ ! -f /.dockerenv ]; then
  DOCKER_ID=$(./scripts/docker-get-id)
  COMMAND="start-and-connect"
  if [ -n "$DOCKER_ID" ]; then
    COMMAND="connect"
  fi
  echo -e "\nThis must be run inside the docker container. Please run \`yarn docker:${COMMAND}\` and try again.\n"
  exit 1
fi

${@:1}