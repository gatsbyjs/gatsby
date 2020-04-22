#!/bin/bash

# Run the build (after purging .cache) and output the amount of time
# taken by the query execution phase
#
# run with `bin/runQueryTiming.sh`

output=$(rm -rf .cache && gatsby build | grep "run graphql queries")
echo "$output" | cut -d' ' -f 6
