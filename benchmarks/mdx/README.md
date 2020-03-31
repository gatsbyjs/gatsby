# MDX Benchmark

This Gatsby site generates MDX files and downloads sample images on postinstall and places them in `src/articles`. In order for that to work, the env var `BENCHMARK_LEVEL` needs to be set to a number when you call `yarn` to install, so:

```
BENCHMARK_LEVEL=1 yarn

gatsby build
```

If you see "Error: Expected an integer but received: " then you did not set the level env var.

This will not use an external source for data while building, but will download some remote images while installing.

# Levels

The `BENCHMARK_LEVEL` is the amount of times to multiply 512 by 2. The level is used to determine how many articles to generate.

Level 1 = 512

Level 2 = 1024

Level 3 = 2048

etc.
