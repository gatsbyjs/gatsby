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
      const queriesFixture = scenario.queriesFixtures.find(config =>
        config.runs.includes(run)
      )

      if (queriesFixture) {
        queries[scenario.name] = queriesFixture.query
      }
    }
  })

  return queries
}

module.exports = {
  // collectScenarios,
  getQueriesForRun,
  getPluginsForRun,
  getAllPlugins,
}
