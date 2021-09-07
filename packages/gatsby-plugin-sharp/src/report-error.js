const reportError = (message, err, reporter) => {
  if (reporter) {
    reporter.error({
      id: `gatsby-plugin-sharp-20000`,
      context: { sourceMessage: message },
      error: err,
    })
  } else {
    console.error(message, err)
  }

  if (process.env.gatsby_executing_command === `build`) {
    process.exit(1)
  }
}
exports.reportError = reportError
