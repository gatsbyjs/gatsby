exports.onPreInit = ({ reporter }) => {
  reporter.setErrorMap({
    1337: {
      text: context => `Error text is ${context.someProp}`,
      level: `ERROR`,
      docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
    },
  })

  const activity = reporter.activityTimer(`Test Activity`)
  activity.start()

  activity.panicOnBuild({
    id: `1337`,
    context: { someProp: `Naruto` },
  })
}