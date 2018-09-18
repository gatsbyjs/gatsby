#!/bin/bash
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}" # set to third arg if defined, otherwise use ../../
status=""

npm install -g gatsby-dev-cli
cd integration-tests

for test in *; do
  if [ -d "$test" ]; then
    cd "$test"
    yarn &&
    gatsby-dev --set-path-to-repo $GATSBY_PATH &&
    gatsby-dev --scan-once --quiet --copy-all &&

    yarn test &&
    status="${status}[success] building $test"$'\n' ||
    status="${status}[failure] building $test"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"