exports.onPostBootstrap = async ({ actions }) => {
  const result = await actions.createJobV2({
    name: `TEST_JOB`,
    inputPaths: [],
    outputDir: `./public`,
    args: {
      result: `hello`,
    },
  })

  if (result.result !== `hello`) {
    throw new Error(`the result of our worker is wrong`)
  }
}
