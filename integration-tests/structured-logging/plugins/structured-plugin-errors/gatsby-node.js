exports.onPreInit = ({ reporter }) => {
  reporter.setErrorMap({
    TEST_ERROR: {
      text: context => `Error text is ${context && context.someProp}`,
      level: "ERROR",
      docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
    },
  })

  reporter.info("setErrorMap")

  if (process.env.PANIC_IN_PLUGIN) {
    reporter.panic({ id: "TEST_ERROR", context: { someProp: `PANIC!` } })
  }
}
