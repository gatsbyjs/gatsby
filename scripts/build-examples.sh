#!/bin/bash

status=""

# Examples still validate against Yarn 1, but invoking `yarn` directly from the
# pnpm-rooted monorepo can resolve against the repo root packageManager field.
run_example_yarn() {
  env COREPACK_ENABLE_STRICT=0 corepack yarn@1.22.22 "$@"
}

pnpm bootstrap && cd examples &&

for example in *; do
  if [ -d "$example" ]; then
    cd "$example" &&
    rm -f yarn.lock &&
    run_example_yarn &&
    gatsby-dev -s &&
    run_example_yarn build &&
    status="${status}[success] building $example"$'\n' ||
    status="${status}[failure] building $example"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"
