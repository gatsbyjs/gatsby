module.exports = ({ defaultHost }) => {
  return {
    config: {
      alias: `config-file`,
      type: `string`,
      default: `gatsby-config`,
      describe: `An alternative configuration file`,
    },

    // hosting
    host: {
      alias: `host`,
      type: `string`,
      default: defaultHost,
      describe: `Set host. Defaults to ${defaultHost}`,
    },
    open: {
      alias: `open`,
      type: `boolean`,
      describe: `Open the site in your (default) browser for you.`,
    },
    prefixPath: {
      type: `boolean`,
      default: false,
      describe: `Serve site with link paths prefixed (if built with pathPrefix in your gatsby-config.js).`,
    },
    https: {
      alias: `https`,
      type: `boolean`,
      describe: `Use HTTPS. See https://www.gatsbyjs.org/docs/local-https/ as a guide`,
    },
    certFile: {
      alias: `cert-file`,
      type: `string`,
      default: ``,
      describe: `Custom HTTPS cert file (relative path; also required: --https, --key-file). See https://www.gatsbyjs.org/docs/local-https/`,
    },
    keyFile: {
      alias: `key-file`,
      type: `string`,
      default: ``,
      describe: `Custom HTTPS key file (relative path; also required: --https, --cert-file). See https://www.gatsbyjs.org/docs/local-https/`,
    },

    // misc
    clipboard: {
      alias: `clipboard`,
      type: `boolean`,
      default: false,
      describe: `Automagically copy environment information to clipboard`,
    },
    noColor: {
      alias: `no-colors`,
      default: false,
      type: `boolean`,
      describe: `Turn off the color in output`,
      global: true,
    },
    noUgly: {
      type: `boolean`,
      default: false,
      describe: `Build site without uglifying JS bundles (for debugging).`,
    },
    tracer: {
      type: `string`,
      describe: `Tracer configuration file (OpenTracing compatible). See https://gatsby.dev/tracing`,
    },
    verbose: {
      default: false,
      type: `boolean`,
      describe: `Turn on verbose output`,
      global: true,
    },
  }
}
