#!/bin/bash

status=""

pnpm bootstrap && cd examples &&

for example in *; do
  if [ -d "$example" ]; then
    cd "$example" &&
    rm -f yarn.lock &&
    env COREPACK_ENABLE_STRICT=0 yarn &&
    gatsby-dev -s &&
    env COREPACK_ENABLE_STRICT=0 yarn build &&
    status="${status}[success] building $example"$'\n' ||
    status="${status}[failure] building $example"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"
