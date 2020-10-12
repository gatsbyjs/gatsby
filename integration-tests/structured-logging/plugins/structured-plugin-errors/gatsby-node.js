exports.onPreInit = ({ reporter }) => {
  reporter.setErrorMap({
    "1337": {
      text: context => `Error text is ${context && context.someProp}`,
      level: "ERROR",
      category: "SYSTEM",
      docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
    },
  })

  reporter.info("setErrorMap")

  if (process.env.PANIC_IN_PLUGIN) {
    reporter.panic({ id: "1337", context: { someProp: `PANIC!` } })
  }
}
