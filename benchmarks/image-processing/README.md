# Image Processing benchmark

Benchmarks Gatsby's image processing capabilities
by downloading and processing images.

Defaults to building a site with 100 image pages. Set the `NUM_IMAGES` environment variable to change that e.g. `NUM_IMAGES=1000 gatsby build`

The max number of images you can process is 65535.

# Running the benchmark

First, install node modules required by package.json. This is needed only one time. Then run the build

```shell
npm install
npm run build
```

Alternatively;

```shell
NUM_PAGES=2000 yarn bench
```
