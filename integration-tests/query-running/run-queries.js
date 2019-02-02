const { getTestInputs, saveTestOutput } = require(`./test-utils`)

const runQueries = async graphql => {
  const tests = await getTestInputs()

  await Promise.all(
    tests.map(async testInput => {
      const results = await graphql(testInput.query)
      await saveTestOutput({ ...testInput, results })
    })
  )
}

module.exports = runQueries
