## Markdown Table Benchmark

This benchmark was originally created to benchmark Gatsby's node creation and query running by creating lots of pages rendered from Markdown.

However, it generates the pages as part of the test, which adds overhead and skews timing (warms up node / memory).

Additionally it was leaning heavily on the markdown plugin because the tables were taking a lot of time to process.

Keeping this benchmark for historical reasons but would suggest to pick one of the other markdown benchmarks.

## Usage

Defaults to building a site with 5k markdown pages and 25 maximum rows per age. Set the `NUM_PAGES` and `MAX_NUM_ROWS` environment variables to change that e.g. `NUM_PAGES=25000 MAX_NUM_ROWS=100 gatsby build`

## Running the benchmark

First, install node modules required by package.json. This is needed only one time. Then run the build

```bash
yarn
yarn build
```
