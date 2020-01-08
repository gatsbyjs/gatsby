#!/bin/bash

status=""

cd benchmarks &&

for benchmark in *; do
  if [ -d "$benchmark" ]; then
    for i in 1000 5000 10000 25000 100000
      export NUM_PAGES = i
      cd "$benchmark" &&
      npm i && # consider adding gatsby@latest
      gatsby build &&
      status="${status}[success] building $benchmark"$'\n' ||
      status="${status}[failure] building $benchmark"$'\n'
      cd ..
  fi
done

echo
echo -n "${status}"
