#!/bin/bash
GATSBY_PATH="${CIRCLE_WORKING_DIRECTORY:-../../}"
status=""

# note: this presumes yarn bootstrap has been run in root of repo
cd integration-tests

for test in *; do
  if [ -d "$test" ]; then
    cd "$test"
    yarn &&
    sudo gatsby-dev --set-path-to-repo $GATSBY_PATH &&
    sudo gatsby-dev --scan-once --quiet --copy-all &&

    yarn test &&
    status="${status}[success] building $test"$'\n' ||
    status="${status}[failure] building $test"$'\n'
    cd ..
  fi
done

echo
echo -n "${status}"