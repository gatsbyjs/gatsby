const glob = require(`glob`)
const _ = require(`lodash`)
const path = require(`path`)

const collectScenarios = () => {
  const scenarios = glob
    .sync(path.join(__dirname, `..`, `plugins`, `**`, `scenario.js`))
    .map(filename => {
      const scenarioPath = path.relative(
        path.join(__dirname, `..`, `plugins`),
        path.dirname(filename)
      )

      return {
        name: scenarioPath,
        filename,
        ...require(filename),
      }
    })

  return scenarios
}

const getPluginsForRun = run => {
  const plugins = []
  collectScenarios().forEach(scenario => {
    if (scenario.config) {
      const config = scenario.config.find(config => config.runs.includes(run))
      if (config && config.plugins) {
        plugins.push(...config.plugins)
      }
    }
  })
  return _.uniq(plugins)
}

const getAllPlugins = () => {
  const plugins = []

  collectScenarios().forEach(scenario => {
    if (scenario.config) {
      scenario.config.forEach(config => {
        if (config.plugins) {
          plugins.push(...config.plugins)
        }
      })
    }
  })

  return _.uniq(plugins)
}

const getQueriesForRun = run => {
  const queries = {}

  collectScenarios().forEach(scenario => {
    if (scenario.queriesFixtures) {
      const queriesFixtures = scenario.queriesFixtures.filter(config =>
        config.runs.includes(run)
      )

      if (queriesFixtures.length) {
        queries[scenario.name] = queriesFixtures.reduce((acc, queryFixture) => {
          const fixtureType = queryFixture.type

          if (!fixtureType) {
            console.error(
              `ERROR: query fixture from ${scenario.filename} doesn't have type`
            )
          } else if (![`data`, `types`].includes(fixtureType)) {
            console.error(
              `ERROR: query fixture from ${scenario.filename} has incorrect type ("${fixtureType}"). Available types: ["data", "types"]`
            )
          } else {
            acc[fixtureType] = queryFixture.query
          }
          return acc
        }, {})
      }
    }
  })

  return queries
}

module.exports = {
  getQueriesForRun,
  getPluginsForRun,
  getAllPlugins,
}
