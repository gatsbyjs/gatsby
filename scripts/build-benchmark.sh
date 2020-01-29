#!/bin/bash -eux

set -e
set -u
set -x

BENCHMARKS=(
  # create-pages
  # image-processing
  markdown_id
  markdown_slug
  markdown_table
  # plugin-manifest
  # query
)

SIZES=(
    512
   4096
   8192
  32768
)

cd benchmarks
for benchmark in "${BENCHMARKS[@]}"; do
    cd "${benchmark}"
    for num in "${SIZES[@]}"; do
      NUM_PAGES=${num} npm install
      NUM_PAGES=${num} ./node_modules/.bin/gatsby build
    done
    cd ..
done
