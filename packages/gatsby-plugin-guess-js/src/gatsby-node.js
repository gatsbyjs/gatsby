const { GuessPlugin } = require(`guess-webpack`)

let guessPlugin
exports.onPreBootstrap = (_, pluginOptions) => {
  const { period, GAViewID } = pluginOptions
  period.startDate = new Date(period.startDate)
  period.endDate = new Date(period.endDate)
  guessPlugin = new GuessPlugin({
    // GA view ID.
    GA: GAViewID,

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
    period: period
      ? period
      : {
          startDate: new Date(`2018-1-1`),
          endDate: new Date(),
        },
  })
}

exports.onCreateWebpackConfig = ({ actions, stage }, pluginOptions) => {
  actions.setWebpackConfig({
    plugins: [guessPlugin],
  })
}
