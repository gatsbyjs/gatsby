# createPages benchmark

Stress tests creating lots of tiny pages.

Defaults to building a site with 5k pages. Set the `NUM_PAGES` environment variable to change that e.g. `NUM_PAGES=25000 gatsby build`

# Running the benchmark
First install node modules required by package.json. This is needed only one time. Then run the build
```
npm install --save
gatsby build
```
gatsby will use whatever `node` binary is in your path. If you have a new binary point y
our PATH to the new binary.
