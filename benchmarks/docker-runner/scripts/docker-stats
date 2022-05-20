#!/bin/bash

DOCKER_ID=$(./scripts/docker-get-id)
if [ -z "$DOCKER_ID" ]; then
  echo -e "\nNo gatsby-generic-benchmark container was found. Run \`yarn docker:start\` to start one.\n"
  exit 1
fi

FORMAT="Gatsby Memory Benchmark Container----CPU: {{.CPUPerc }}--Memory: {{.MemUsage}}--Network: {{.NetIO}}"
STATS=$(docker stats $DOCKER_ID --no-stream --format="$FORMAT")
clear

while [ -n "$STATS" ]; do
  echo $STATS | sed "s/--/\n/g"
  DOCKER_ID=$(./scripts/docker-get-id)
  STATS=$(docker stats $DOCKER_ID --no-stream --format="$FORMAT")
  clear
done