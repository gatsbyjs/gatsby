# Markdown benchmark

Stress tests creating lots of pages rendered from Markdown.

Defaults to building a site with 5k markdown pages. Set the `NUM_PAGES` environment variable to change that e.g. `NUM_PAGES=25000 gatsby build`

# Running the benchmark

First, install node modules required by package.json. This is needed only one time. Then run the build

```bash
npm install
npm run build
```
