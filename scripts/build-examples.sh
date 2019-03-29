#!/bin/bash

status=""

yarn bootstrap && cd examples &&

for example in *; do
  if [ -d "$example" ]; then
    cd "$example" &&
    rm -f yarn.lock &&
    yarn &&
    gatsby-dev -s &&
    yarn build &&
    status="${status}[success] building $example"$'\n' ||
    status="${status}[failure] building $example"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"
