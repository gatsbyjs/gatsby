// this IS executed in process that spawn worker to analyze exports and create functions for them on worker pool object
// so we want to use `@babel/register` ONLY inside actual worker as otherwise it does mess with jest transformation and tools like `rewire`
// see `./create-test-worker.ts` file for explanation why this env var is used.
if (process.env.JEST_WORKER_ID) {
  // spawned process won't use jest config to support TS, so we need to add support ourselves
  require(`@babel/register`)({
    extensions: [`.js`, `.ts`],
    configFile: require.resolve(`../../../../../babel.config.js`),
    ignore: [/node_modules/],
  })
}

module.exports = require(`./child-for-tests`)
