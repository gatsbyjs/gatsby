const { stripIndent, stripIndents } = require(`common-tags`)

const optionalGraphQLInfo = context =>
  `${context.codeFrame ? `\n\n${context.codeFrame}` : ``}${
    context.filePath ? `\n\nFile path: ${context.filePath}` : ``
  }${context.urlPath ? `\nUrl path: ${context.urlPath}` : ``}${
    context.plugin ? `\nPlugin: ${context.plugin}` : ``
  }`

const errorMap = {
  "": {
    text: context => {
      const sourceMessage = context.sourceMessage
        ? context.sourceMessage
        : `There was an error`
      return sourceMessage
    },
    level: `ERROR`,
  },
  "95312": {
    text: context =>
      `"${context.ref}" is not available during server side rendering.`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "95313": {
    text: context =>
      `Building static HTML failed${
        context.errorPath ? ` for path "${context.errorPath}"` : ``
      }`,
    level: `ERROR`,
    docsUrl: `https://gatsby.dev/debug-html`,
  },
  "98123": {
    text: context => `${context.stageLabel} failed\n\n${context.message}`,
    type: `WEBPACK`,
    level: `ERROR`,
  },
  "85901": {
    text: context =>
      stripIndent(`
        There was an error in your GraphQL query:\n\n${
          context.sourceMessage
        }${optionalGraphQLInfo(context)}`),
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Deprecated
  "85907": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.message}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85908": {
    text: context => {
      const closestFragment = context.closestFragment
        ? `\n\nDid you mean to use ` + `"${context.closestFragment}"?`
        : ``

      return `There was an error in your GraphQL query:\n\nThe fragment "${context.fragmentName}" does not exist.\n\n${context.codeFrame}${closestFragment}`
    },
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Deprecated
  "85909": {
    text: context => context.sourceMessage,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85910": {
    text: context =>
      stripIndents(`
        Multiple "root" queries found: "${context.name}" and "${context.otherName}".
        Only the first ("${context.otherName}") will be registered.

        Instead of:

        ${context.beforeCodeFrame}

        Do:

        ${context.afterCodeFrame}

        This can happen when you use two page/static queries in one file. Please combine those into one query.
        If you're defining multiple components (each with a static query) in one file, you'll need to move each component to its own file.
      `),
    type: `GRAPHQL`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/graphql/`,
  },
  "85911": {
    text: context =>
      stripIndent(`
        There was a problem parsing "${context.filePath}"; any GraphQL
        fragments or queries in this file were not processed.

        This may indicate a syntax error in the code, or it may be a file type
        that Gatsby does not know how to parse.
      `),
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85912": {
    text: context => `Failed to parse preprocessed file ${context.filePath}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85913": {
    text: context =>
      `There was a problem reading the file: ${context.filePath}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85914": {
    text: context =>
      `There was a problem reading the file: ${context.filePath}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // default parsing error
  "85915": {
    text: context =>
      `There was a problem parsing the GraphQL query in file: ${context.filePath}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85916": {
    text: context =>
      `String interpolation is not allowed in graphql tag:\n\n${context.codeFrame}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85917": {
    text: context =>
      `Unexpected empty graphql tag${
        context.codeFrame ? `\n\n${context.codeFrame}` : ``
      }`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85918": {
    text: context =>
      stripIndent(`
        GraphQL syntax error in query:\n\n${context.sourceMessage}${
        context.codeFrame ? `\n\n${context.codeFrame}` : ``
      }`),
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Duplicate fragment
  "85919": {
    text: context =>
      stripIndent(`
      Found two different GraphQL fragments with identical name "${context.fragmentName}". Fragment names must be unique

      File: ${context.leftFragment.filePath}
      ${context.leftFragment.codeFrame}

      File: ${context.rightFragment.filePath}
      ${context.rightFragment.codeFrame}
    `),
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Undefined variables in Queries
  "85920": {
    text: context => {
      const generalMessage = stripIndents(`You might have a typo in the variable name "${context.variableName}" or you didn't provide the variable via context to this page query. Have a look at the docs to learn how to add data to context:

      https://www.gatsbyjs.org/docs/page-query/#how-to-add-query-variables-to-a-page-query`)

      const staticQueryMessage = stripIndents(`If you're not using a page query but a StaticQuery / useStaticQuery you see this error because they currently don't support variables. To learn more about the limitations of StaticQuery / useStaticQuery, please visit these docs:

      https://www.gatsbyjs.org/docs/static-query/
      https://www.gatsbyjs.org/docs/use-static-query/`)

      return stripIndent(`
        There was an error in your GraphQL query:\n\n${
          context.sourceMessage
        }${optionalGraphQLInfo(
        context
      )}\n\n${generalMessage}\n\n${staticQueryMessage}`)
    },
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85921": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.sourceMessage}\n\nIf you're e.g. filtering for specific nodes make sure that you choose the correct field (that has the same type "${context.inputType}") or adjust the context variable to the type "${context.expectedType}".`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85922": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.sourceMessage}\n\nThis can happen if you e.g. accidentally added { } to the field "${context.fieldName}". If you didn't expect "${context.fieldName}" to be of type "${context.fieldType}" make sure that your input source and/or plugin is correct.`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85923": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${context.sourceMessage}\n\nIf you don't expect "${context.field}" to exist on the type "${context.type}" it is most likely a typo.\nHowever, if you expect "${context.field}" to exist there are a couple of solutions to common problems:\n\n- If you added a new data source and/or changed something inside gatsby-node.js/gatsby-config.js, please try a restart of your development server\n- The field might be accessible in another subfield, please try your query in GraphiQL and use the GraphiQL explorer to see which fields you can query and what shape they have\n- You want to optionally use your field "${context.field}" and right now it is not used anywhere. Therefore Gatsby can't infer the type and add it to the GraphQL schema. A quick fix is to add a least one entry with that field ("dummy content")\n\nIt is recommended to explicitly type your GraphQL schema if you want to use optional fields. This way you don't have to add the mentioned "dummy content". Visit our docs to learn how you can define the schema for "${context.type}":\nhttps://www.gatsbyjs.org/docs/schema-customization/#creating-type-definitions`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85924": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${
        context.sourceMessage
      }\n\nThis can happen when you or a plugin/theme explicitly defined the GraphQL schema for this GraphQL object type via the schema customization API and "${
        context.value
      }" doesn't match the (scalar) type of "${
        context.type
      }".${optionalGraphQLInfo(context)}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  "85925": {
    text: context =>
      `There was an error in your GraphQL query:\n\n${
        context.sourceMessage
      }\n\nThe field "${
        context.field
      }" was explicitly defined as non-nullable via the schema customization API (by yourself or a plugin/theme). This means that this field is not optional and you have to define a value. If this is not your desired behavior and you defined the schema yourself, go to "createTypes" in gatsby-node.js. If you're using a plugin/theme, you can learn more here on how to fix field types:\nhttps://www.gatsbyjs.org/docs/schema-customization/#fixing-field-types${optionalGraphQLInfo(
        context
      )}`,
    type: `GRAPHQL`,
    level: `ERROR`,
  },
  // Config errors
  "10123": {
    text: context =>
      `We encountered an error while trying to load your site's ${context.configName}. Please fix the error and try again.`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10124": {
    text: context =>
      `It looks like you were trying to add the config file? Please rename "${context.nearMatch}" to "${context.configName}.js"`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10125": {
    text: context =>
      `Your ${context.configName} file is in the wrong place. You've placed it in the src/ directory. It must instead be at the root of your site next to your package.json file.`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10126": {
    text: context =>
      `${context.path}/${context.configName} cannot export a function.` +
      `\n\nA ${context.configName} exported as a Function can only be used as a theme and not run directly.` +
      `\nIf you are trying to run a theme directly, use the theme in an example site or starter instead and run that site to test.` +
      `\nIf you are in the root gatsby-config.js for your site, change the export to be an object and not a function as functions` +
      `\nare not supported in the root gatsby-config.`,
    type: `CONFIG`,
    level: `ERROR`,
  },
  "10226": {
    text: context =>
      [
        `Couldn't find the "${context.themeName}" plugin declared in "${context.configFilePath}".`,
        context.pathToLocalTheme &&
          `Tried looking for a local plugin in ${context.pathToLocalTheme}.`,
        `Tried looking for an installed package in the following paths:\n${context.nodeResolutionPaths
          .map(potentialLocationPath => ` - ${potentialLocationPath}`)
          .join(`\n`)}`,
      ]
        .filter(Boolean)
        .join(`\n\n`),
    type: `CONFIG`,
    level: `ERROR`,
  },
  // Plugin errors
  "11321": {
    text: context =>
      `"${context.pluginName}" threw an error while running the ${
        context.api
      } lifecycle:\n\n${context.message}${optionalGraphQLInfo(context)}`,
    type: `PLUGIN`,
    level: `ERROR`,
  },
  "11322": {
    text: context =>
      `${
        context.pluginName
      } created a page and didn't pass the path to the component.\n\nThe page object passed to createPage:\n${JSON.stringify(
        context.pageObject,
        null,
        4
      )}\n\nSee the documentation for the "createPage" action — https://www.gatsbyjs.org/docs/actions/#createPage`,
    level: `ERROR`,
  },
  "11323": {
    text: context =>
      `${
        context.pluginName
      } must set the page path when creating a page.\n\nThe page object passed to createPage:\n${JSON.stringify(
        context.pageObject,
        null,
        4
      )}\n\nSee the documentation for the "createPage" action — https://www.gatsbyjs.org/docs/actions/#createPage`,
    level: `ERROR`,
  },
  "11324": {
    text: context =>
      `${context.message}\n\nSee the documentation for the "createPage" action — https://www.gatsbyjs.org/docs/actions/#createPage`,
    level: `ERROR`,
  },
  "11325": {
    text: context =>
      `${
        context.pluginName
      } created a page with a component that doesn't exist.\n\nThe path to the missing component is "${
        context.component
      }"\n\nThe page object passed to createPage:\n${JSON.stringify(
        context.pageObject,
        null,
        4
      )}\n\nSee the documentation for the "createPage" action — https://www.gatsbyjs.org/docs/actions/#createPage`,
    level: `ERROR`,
  },
  "11326": {
    text: context =>
      `${
        context.pluginName
      } must set the absolute path to the page component when create creating a page.\n\nThe (relative) path you used for the component is "${
        context.component
      }"\n\nYou can convert a relative path to an absolute path by requiring the path module and calling path.resolve() e.g.\n\nconst path = require("path")\npath.resolve("${
        context.component
      }")\n\nThe page object passed to createPage:\n${JSON.stringify(
        context.pageObject,
        null,
        4
      )}\n\nSee the documentation for the "createPage" action — https://www.gatsbyjs.org/docs/actions/#createPage`,
    level: `ERROR`,
  },
  "11327": {
    text: context =>
      `You have an empty file in the "src/pages" directory at "${context.relativePath}". Please remove it or make it a valid component`,
    level: `ERROR`,
  },
  "11328": {
    text: context =>
      `A page component must export a React component for it to be valid. Please make sure this file exports a React component:\n\n${context.fileName}`,
    level: `ERROR`,
  },
  // invalid or deprecated APIs
  "11329": {
    text: context =>
      [
        stripIndent(`
          Your plugins must export known APIs from their gatsby-${context.exportType}.js.

          See https://www.gatsbyjs.org/docs/${context.exportType}-apis/ for the list of Gatsby ${context.exportType} APIs.
        `),
      ]
        .concat([``].concat(context.errors))
        .concat(
          context.fixes.length > 0
            ? [
                ``,
                `Some of the following may help fix the error(s):`,
                ``,
                ...context.fixes.map(fix => `- ${fix}`),
              ]
            : []
        )
        .join(`\n`),
    level: `ERROR`,
  },
  // "X" is not defined in Gatsby's node APIs
  "11330": {
    text: context =>
      `"${context.pluginName}" threw an error while running the ${context.api} lifecycle:\n\n${context.message}\n\n${context.codeFrame}\n\nMake sure that you don't have a typo somewhere and use valid arguments in ${context.api} lifecycle.\nLearn more about ${context.api} here: https://www.gatsbyjs.org/docs/node-apis/#${context.api}`,
    type: `PLUGIN`,
    level: `ERROR`,
  },
  // Directory/file name exceeds OS character limit
  "11331": {
    text: context =>
      [
        `One or more path segments are too long - they exceed OS filename length limit.\n`,
        `Page path: "${context.path}"`,
        `Invalid segments:\n${context.invalidPathSegments
          .map(segment => ` - "${segment}"`)
          .join(`\n`)}`,
        ...(!context.isProduction
          ? [
              `\nThis will fail production builds, please adjust your paths.`,
              `\nIn development mode gatsby truncated to: "${context.truncatedPath}"`,
            ]
          : []),
      ]
        .filter(Boolean)
        .join(`\n`),
    level: `ERROR`,
  },
  // node object didn't pass validation
  "11467": {
    text: context =>
      [
        `The new node didn't pass validation: ${context.validationErrorMessage}`,
        `Failing node:`,
        JSON.stringify(context.node, null, 4),
        `Note: there might be more nodes that failed validation. Output is limited to one node per type of validation failure to limit terminal spam.`,
        context.codeFrame,
      ]
        .filter(Boolean)
        .join(`\n\n`),
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/actions/#createNode`,
  },
  // local SSL certificate errors
  "11521": {
    text: () =>
      `for custom ssl --https, --cert-file, and --key-file must be used together`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/local-https/#custom-key-and-certificate-files`,
  },
  "11522": {
    text: () => `Failed to generate dev SSL certificate`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/local-https/#setup`,
  },
  // cli new command errors
  "11610": {
    text: context =>
      `It looks like you gave wrong argument orders . Try running instead "gatsby new ${context.starter} ${context.rootPath}"`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
  },
  "11611": {
    text: context =>
      `It looks like you passed a URL to your project name. Try running instead "gatsby new new-gatsby-project ${context.rootPath}"`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
  },
  "11612": {
    text: context =>
      `Could not create a project in "${context.path}" because it's not a valid path`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
  },
  "11613": {
    text: context => `Directory ${context.rootPath} is already an npm project`,
    level: `ERROR`,
    docsUrl: `https://www.gatsbyjs.org/docs/gatsby-cli/#new`,
  },
}

module.exports = { errorMap, defaultError: errorMap[``] }
