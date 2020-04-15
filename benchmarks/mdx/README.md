# MDX Benchmark

Benchmark for MDX pages.
Mock data is generated during the dependency installation step.
The number of pages generated is read from `NUM_PAGES=` (defaults to `512`).

```
$ export NUM_PAGES=1024
$ yarn install    # or npm install
$ gatsby build    # or npm run build
```

This will not use an external source for data while building, but will download some remote images while installing.
