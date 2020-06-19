import PrettyError from "pretty-error"

interface IErrorWithCodeFrame extends Error {
  codeFrame: string
}

type PrettyRenderError = Error | IErrorWithCodeFrame

export function getErrorFormatter(): PrettyError {
  const prettyError = new PrettyError()
  const baseRender = prettyError.render

  prettyError.skipNodeFiles()
  prettyError.skipPackage(
    `regenerator-runtime`,
    `graphql`,
    `core-js`
    // `static-site-generator-webpack-plugin`,
    // `tapable`, // webpack
  )

  // @ts-ignore the type defs in prettyError are wrong
  prettyError.skip((traceLine: any) => {
    if (traceLine && traceLine.file === `asyncToGenerator.js`) return true
    return false
  })

  prettyError.appendStyle({
    "pretty-error": {
      marginTop: 1,
    },
    "pretty-error > header": {
      background: `red`,
    },
    "pretty-error > header > colon": {
      color: `white`,
    },
  })

  if (process.env.FORCE_COLOR === `0`) {
    prettyError.withoutColors()
  }

  prettyError.render = (
    err: PrettyRenderError | PrettyRenderError[]
  ): string => {
    if (Array.isArray(err)) {
      return err.map(e => prettyError.render(e)).join(`\n`)
    }

    let rendered = baseRender.call(prettyError, err)
    if (`codeFrame` in err) rendered = `\n${err.codeFrame}\n${rendered}`
    return rendered
  }
  return prettyError
}
