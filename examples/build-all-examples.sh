#!/usr/bin/env bash

# 🚨 WARNING: This script takes a LONG time to run. (Hours.)

# To use this script, first run the following from the command line:
# cd examples
# ./build-all-examples.sh > build-results.txt

# Output will be put into a new file at examples/build-results.txt

# NOTE: Some of the builds will fail because the folder structure
# for that example is different. e.g., examples/creating-source-plugins/
# contains multiple Gatsby sites, each in their own folder.
#
# This script won't catch all those edge cases. It's mainly an attempt
# to handle all the easy cases, while identifying individual failing
# examples that need to be investigated manually.

# For each directory in examples/
for exampleDirectory in ./*/; do
  # Debugging? Uncomment conditional below to test only 2 examples
  # Expected behavior:
  # - creating-source-plugins fails (since folder contains nested Gatsby sites)
  # - client-only-paths succeeds
  #
  # if [[ $exampleDirectory != "./creating-source-plugins/" && $exampleDirectory != "./client-only-paths/" ]]; then
  #   continue
  # fi

  cd $exampleDirectory
  echo "👀 CHECKING: $exampleDirectory"

  echo "Installing $exampleDirectory..."
  if npm install --no-save > /dev/null 2>&1; then
    # --no-save flag prevents empty newline from being added to the end of package.json
    echo "Successfully installed: $exampleDirectory"
  else
    echo "🚨 ERROR installing: $exampleDirectory"
    cd ..
    continue
  fi

  echo "Building $exampleDirectory..."
  if gatsby build > /dev/null 2>&1; then
    echo "✅ SUCCESS building: $exampleDirectory"
  else
    echo "🚨 ERROR building: $exampleDirectory"
  fi

  # Move back into the examples/ directory
  cd ..

done
