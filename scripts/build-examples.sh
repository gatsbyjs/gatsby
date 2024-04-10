#!/bin/bash

status=""

pnpm run bootstrap && cd examples &&

for example in *; do
  if [ -d "$example" ]; then
    cd "$example" &&
    rm -f pnpm-lock.yaml &&
    pnpm install &&
    gatsby-dev -s &&
    pnpm run build &&
    status="${status}[success] building $example"$'\n' ||
    status="${status}[failure] building $example"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"
