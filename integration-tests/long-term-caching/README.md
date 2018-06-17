# Long-term caching testing

To test that Gatsby correctly changes its JS bundles with every type of change
to site modules a user can make, here we build a site many times, making small
changes between builds, to test that the bundle names change correctly.

After each run, move the public folder to `public-${runNumber}`.

You can easily compare run outputs with the tool Meld. `meld public-1 public-2`.

## Runs

1.  Hello world
2.  Add character to src/pages/index.js
3.  Add import to src/pages/index.js (`import gray from "gray-percentage"`)
4.  Add async import (`import('../async')`)
5.  Add another async import (`import("../async-2")`)
6.  Add character to `async-2.js`
