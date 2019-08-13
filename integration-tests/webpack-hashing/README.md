# Webpack Hashing

HTML files and `page-data.json` files contain a hash (that comes from webpack). This hash is a function of the chunks that are used by this page. These tests assert that the chunks are calculated correctly.

## Runs

1.  Clean build
2.  Add character to src/pages/index.js
3.  Add import to src/pages/index.js (`import gray from "gray-percentage"`)
4.  Add async import (`import('../async')`)
5.  Add character to `async.js`
