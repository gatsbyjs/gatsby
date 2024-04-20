# MD Benchmark

Benchmark for MD pages.
Mock data is generated during the dependency installation step.
The number of pages generated is read from `NUM_PAGES=` (defaults to `512`).

```shell
export NUM_PAGES=1024
pnpm install
pnpm run build
```

This will not use an external source for data while building, but will download some remote images while installing.
