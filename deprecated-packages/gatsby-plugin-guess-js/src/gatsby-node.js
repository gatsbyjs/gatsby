const { GuessPlugin } = require(`guess-webpack`)

let guessPlugin
let jwt

exports.onPreInit = (_, pluginOptions) => {
  jwt = pluginOptions.jwt

  // remove jwt from our config as we don't want it to leak into gatsby-browser.js
  delete pluginOptions.jwt
}

exports.onPreBootstrap = (_, pluginOptions) => {
  const { GAViewID, reportProvider } = pluginOptions
  let { period } = pluginOptions

  if (period) {
    period.startDate = new Date(period.startDate)
    period.endDate = new Date(period.endDate)
  } else {
    const startDate = new Date()
    // We'll load 1 year of data if no period is being specified
    startDate.setDate(startDate.getDate() - 365)
    period = {
      startDate,
      endDate: new Date(),
    }
  }

  guessPlugin = new GuessPlugin({
    // GA view ID.
    GA: GAViewID,

    jwt: jwt,

    reportProvider: reportProvider,

    // Hints Guess to not perform prefetching and delegate this logic to
    // its consumer.
    runtime: {
      delegate: true,
    },

    // Since Gatsby already has the required metadata for pre-fetching,
    // Guess does not have to collect the routes and the corresponding
    // bundle entry points.
    routeProvider: false,

    // Optional argument. It takes the data for the last year if not
    // specified.
    period,
  })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [guessPlugin],
  })
}
