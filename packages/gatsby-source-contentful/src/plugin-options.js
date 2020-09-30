const joi = require(`joi`)
const chalk = require(`chalk`)
const fetch = require(`node-fetch`)

const _ = require(`lodash`)

const DEFAULT_PAGE_LIMIT = 100

const defaultOptions = {
  host: `cdn.contentful.com`,
  environment: `master`,
  downloadLocal: false,
  localeFilter: () => true,
  forceFullSync: false,
  pageLimit: DEFAULT_PAGE_LIMIT,
  useNameForId: true,
}

const createPluginConfig = pluginOptions => {
  const conf = { ...defaultOptions, ...pluginOptions }

  return {
    get: key => conf[key],
    getOriginalPluginOptions: () => pluginOptions,
  }
}

const Joi = joi.extend({
  base: joi.string(),
  type: `secret`,
})

const validateContentfulAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined

  await fetch(
    `https://${pluginOptions.host || defaultOptions.host}/content/v1/spaces/${
      pluginOptions.spaceId
    }`,
    {
      headers: {
        Authorization: `Bearer ${pluginOptions.accessToken}`,
        "Content-Type": `application/json`,
      },
    }
  )
    .then(res => res.json())
    .then(json => {
      if (json.errors)
        throw new Error(
          `Cannot access Contentful Space ${maskText(pluginOptions.spaceId)}`
        )
    })
    .catch(err => {
      throw new Error(`Fetch call to check Contentful access failed.`)
    })

  return undefined
}

const optionsSchema = Joi.object()
  .keys({
    accessToken: Joi.secret()
      .description(
        `Contentful delivery api key, when using the Preview API use your Preview API key`
      )
      .required()
      .empty(),
    spaceId: Joi.secret().description(`Contentful spaceId`).required().empty(),
    host: Joi.string()
      .description(
        `The base host for all the API requests, by default it's 'cdn.contentful.com', if you want to use the Preview API set it to 'preview.contentful.com'. You can use your own host for debugging/testing purposes as long as you respect the same Contentful JSON structure.`
      )
      .default(`cdn.contentful.com`)
      .empty(),
    environment: Joi.string()
      .description(
        `The environment to pull the content from, for more info on environments check out this [Guide](https://www.contentful.com/developers/docs/concepts/multiple-environments/).`
      )
      .default(`master`)
      .empty(),
    downloadLocal: Joi.boolean()
      .description(
        `Downloads and caches ContentfulAsset's to the local filesystem. Allows you to query a ContentfulAsset's localFile field, which is not linked to Contentful's CDN. Useful for reducing data usage.

You can pass in any other options available in the [contentful.js SDK](https://github.com/contentful/contentful.js#configuration).`
      )
      .default(false),
    localeFilter: Joi.func()
      .description(
        `Possibility to limit how many locales/nodes are created in GraphQL. This can limit the memory usage by reducing the amount of nodes created. Useful if you have a large space in contentful and only want to get the data from one selected locale.

For example, to filter locales on only germany \`localeFilter: locale => locale.code === 'de-DE'\`
    
List of locales and their codes can be found in Contentful app -> Settings -> Locales`
      )
      .default(() => true),
    forceFullSync: Joi.boolean()
      .description(
        `Prevents the use of sync tokens when accessing the Contentful API.`
      )
      .default(false),
    pageLimit: Joi.number()
      .integer()
      .description(
        `Number of entries to retrieve from Contentful at a time. Due to some technical limitations, the response payload should not be greater than 7MB when pulling content from Contentful. If you encounter this issue you can set this param to a lower number than 100, e.g 50.`
      )
      .default(100),
    proxy: Joi.object()
      .keys({
        host: Joi.string().required(),
        port: Joi.number().required(),
        auth: Joi.object().keys({
          username: Joi.string(),
          password: Joi.string(),
        }),
      })
      .description(
        `Axios proxy configuration. See the [axios request config documentation](https://github.com/mzabriskie/axios#request-config) for further information about the supported values.`
      ),
    useNameForId: Joi.boolean()
      .description(
        `Use the content's \`name\` when generating the GraphQL schema e.g. a Content Type called \`[Component] Navigation bar\` will be named \`contentfulComponentNavigationBar\`.

    When set to \`false\`, the content's internal ID will be used instead e.g. a Content Type with the ID \`navigationBar\` will be called \`contentfulNavigationBar\`.
    
    Using the ID is a much more stable property to work with as it will change less often. However, in some scenarios, Content Types' IDs will be auto-generated (e.g. when creating a new Content Type without specifying an ID) which means the name in the GraphQL schema will be something like \`contentfulC6XwpTaSiiI2Ak2Ww0oi6qa\`. This won't change and will still function perfectly as a valid field name but it is obviously pretty ugly to work with.
    
    If you are confident your Content Types will have natural-language IDs (e.g. \`blogPost\`), then you should set this option to \`false\`. If you are unable to ensure this, then you should leave this option set to \`true\` (the default).`
      )
      .default(true),
    // default plugins passed by gatsby
    plugins: Joi.array(),
    richText: Joi.object()
      .keys({
        resolveFieldLocales: Joi.boolean()
          .description(
            `If you want to resolve the locales in fields of assets and entries that are referenced by rich text (e.g., via embedded entries or entry hyperlinks), set this to \`true\`. Otherwise, fields of referenced assets or entries will be objects keyed by locale.`
          )
          .default(false),
      })
      .default({}),
  })
  .external(validateContentfulAccess)

const maskedFields = [`accessToken`, `spaceId`]

const validateOptions = async ({ reporter }, options) => {
  try {
    await optionsSchema.validateAsync(options, { abortEarly: false })
  } catch (error) {
    const errors = {}
    error.details.forEach(detail => {
      errors[detail.path[0]] = detail.message
    })
    reporter.panic(`Problems with gatsby-source-contentful plugin options:
${exports.formatPluginOptionsForCLI(options, errors)}`)
  }
}

const formatPluginOptionsForCLI = (pluginOptions, errors = {}) => {
  const optionKeys = new Set(
    Object.keys(pluginOptions)
      .concat(Object.keys(defaultOptions))
      .concat(Object.keys(errors))
  )

  const getDisplayValue = key => {
    const formatValue = value => {
      if (_.isFunction(value)) {
        return `[Function]`
      } else if (maskedFields.includes(key) && typeof value === `string`) {
        return JSON.stringify(maskText(value))
      }
      return JSON.stringify(value)
    }

    if (typeof pluginOptions[key] !== `undefined`) {
      return chalk.green(formatValue(pluginOptions[key]))
    } else if (typeof defaultOptions[key] !== `undefined`) {
      return chalk.dim(formatValue(defaultOptions[key]))
    }

    return chalk.dim(`undefined`)
  }

  const lines = []
  optionKeys.forEach(key => {
    if (key === `plugins`) {
      // skip plugins field automatically added by gatsby
      return
    }

    lines.push(
      `${key}${
        typeof pluginOptions[key] === `undefined` &&
        typeof defaultOptions[key] !== `undefined`
          ? chalk.dim(` (default value)`)
          : ``
      }: ${getDisplayValue(key)}${
        typeof errors[key] !== `undefined` ? ` - ${chalk.red(errors[key])}` : ``
      }`
    )
  })
  return lines.join(`\n`)
}

/**
 * Mask majority of input to not leak any secrets
 * @param {string} input
 * @returns {string} masked text
 */
const maskText = input => {
  // show just 25% of string up to 4 characters
  const hiddenCharactersLength =
    input.length - Math.min(4, Math.floor(input.length * 0.25))

  return `${`*`.repeat(hiddenCharactersLength)}${input.substring(
    hiddenCharactersLength
  )}`
}

export {
  optionsSchema,
  defaultOptions,
  validateOptions,
  formatPluginOptionsForCLI,
  maskText,
  createPluginConfig,
}
