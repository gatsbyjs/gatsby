# Image Processing benchmark

Benchmarks Gatsby's image processing capabilities
by downloading and processing images.

Defaults to building a site with 100 image pages. Set the `NUM_IMAGES` environment variable to change that e.g. `NUM_IMAGES=1000 MAX_NUM_ROWS=100 gatsby build`

The max number of images you can process is 1300.

# Running the benchmark

First, install node modules required by package.json. This is needed only one time. Then run the build

```bash
npm install
npm run build
```
