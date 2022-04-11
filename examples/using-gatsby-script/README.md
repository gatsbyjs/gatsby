# Using gatsby-script

Example site that demonstrates how to use [gatsby-script](../../packages/gatsby-script/README.md).

## Usage

Temporarily until the package is released you should make sure it's built locally. Navigate to `packages/gatsby-script` and run `yarn prepare`.

TODO - Remove the above when appropriate

1. `npm i` to install dependencies
2. `npm run build` to build the site
3. `npm run serve` to serve the site
4. Navigate to http://localhost:9000 in an incognito window
5. Open devtools on the page and access the [performance tab](https://developer.chrome.com/docs/devtools/evaluate-performance/reference/) using Chrome
6. Click the button to start profiling and refresh the page

In the performance tab you should be able to observe scripts loading at different times based on the strategy applied.

Notes:

- You probably don't need to throttle the network or CPU to see the effect, but you can do that if you like to stretch out script loading
- There is an [`<OccupyMainThread>`](./src/components/occupy-main-thread.tsx) component on the page that attempts to occupy the main thread with work so that the idle strategy can be observed
