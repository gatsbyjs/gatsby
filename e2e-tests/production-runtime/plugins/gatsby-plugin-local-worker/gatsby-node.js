const path = require(`path`)

exports.onPostBootstrap = async ({ actions, store }) => {
  const result = await actions.createJobV2({
    name: `TEST_JOB`,
    inputPaths: [],
    outputDir: path.join(store.getState().program.directory, `./public`),
    args: {
      result: `hello`,
    },
  })

  if (result.result !== `hello`) {
    throw new Error(`the result of our worker is wrong`)
  }
}
