# Markdown benchmark

Benchmarks Gatsby's node creation and query running by creating lots of pages rendered from Markdown.

Defaults to building a site with 5k markdown pages and 25 maximum rows per age. Set the `NUM_PAGES` and `MAX_NUM_ROWS` environment variables to change that e.g. `NUM_PAGES=25000 MAX_NUM_ROWS=100 gatsby build`

# Running the benchmark

First, install node modules required by package.json. This is needed only one time. Then run the build

```bash
npm install
npm run build
```
