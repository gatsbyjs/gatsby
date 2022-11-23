exports.onPreInit = ({ reporter }) => {
  reporter.setErrorMap({
    "1337": {
      text: context => `Error text is ${context && context.someProp}`,
      level: "ERROR",
      category: "SYSTEM",
      docsUrl: `https://www.gatsbyjs.com/docs/gatsby-cli/#new`,
    },
    "12345": {
      text: context => `Error text is ${context && context.someProp}`,
      level: "ERROR",
      category: "SYSTEM",
      docsUrl: `https://www.gatsbyjs.com/docs/cheat-sheet/`,
    }
  })

  reporter.info("setErrorMap")

  if (process.env.PANIC_IN_PLUGIN) {
    reporter.error({ id: "structured-plugin-errors_12345", context: { someProp: `MORE ERROR!` } })
    reporter.panic({ id: "1337", context: { someProp: `PANIC!` } })
  }
}
