#!/usr/bin/env bash

# Path to here
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Prepare
docker login -u "$DOCKER_USER" -p "$DOCKER_PASS"
export REPO=mikeallanson/gatsby-graphql
export TAG=latest

# Build
# Build the Dockerfile located at ../, using ../ as the context directory
docker build -t "$REPO":"$TRAVIS_COMMIT" -f "$DIR"/../Dockerfile "$DIR"/../

docker tag "$REPO":"$TRAVIS_COMMIT" "$REPO":"$TAG"
docker tag "$REPO":"$TRAVIS_COMMIT" "$REPO":travis-"$TRAVIS_BUILD_NUMBER"

# Push
docker push "$REPO"
