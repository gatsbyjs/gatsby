// @todo import syntax!
const _ = require(`lodash`)
const fetch = require(`@vercel/fetch-retry`)(require(`node-fetch`))

const { createSchemaCustomization } = require(`./create-schema-customization`)
const { sourceNodes } = require(`./source-nodes`)
const { onPreBootstrap } = require(`./on-pre-bootstrap`)
const { maskText } = require(`./plugin-options`)

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

exports.createSchemaCustomization = createSchemaCustomization

exports.sourceNodes = sourceNodes

exports.onPreBootstrap = onPreBootstrap

exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`).extendNodeType

const validateContentfulAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined

  await fetch(
    `https://${pluginOptions.host}/spaces/${pluginOptions.spaceId}/environments/${pluginOptions.environment}/content_types`,
    {
      headers: {
        Authorization: `Bearer ${pluginOptions.accessToken}`,
        "Content-Type": `application/json`,
      },
    }
  )
    .then(res => res.ok)
    .then(ok => {
      if (!ok) {
        const errorMessage = `Cannot access Contentful space "${maskText(
          pluginOptions.spaceId
        )}" on environment "${
          pluginOptions.environment
        }" with access token "${maskText(
          pluginOptions.accessToken
        )}". Make sure to double check them!`

        throw new Error(errorMessage)
      }
    })

  return undefined
}

const pluginOptionsSchema = ({ Joi }) =>
  Joi.object()
    .keys({
      accessToken: Joi.string()
        .description(
          `Contentful delivery api key, when using the Preview API use your Preview API key`
        )
        .required()
        .empty(),
      spaceId: Joi.string()
        .description(`Contentful spaceId`)
        .required()
        .empty(),
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
        .default(() => () => true),
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
        .default(1000),
      assetDownloadWorkers: Joi.number()
        .integer()
        .description(
          `Number of workers to use when downloading contentful assets. Due to technical limitations, opening too many concurrent requests can cause stalled downloads. If you encounter this issue you can set this param to a lower number than 50, e.g 25.`
        )
        .default(50),
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
      contentfulClientConfig: Joi.object()
        .description(
          `Additional config which will get passed to [Contentfuls JS SDK](https://github.com/contentful/contentful.js#configuration).

          Use this with caution, you might override values this plugin does set for you to connect to Contentful.`
        )
        .unknown(true)
        .default({}),
      // default plugins passed by gatsby
      plugins: Joi.array(),
    })
    .external(validateContentfulAccess)

exports.pluginOptionsSchema = pluginOptionsSchema
