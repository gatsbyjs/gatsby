import { parse } from "gatsby/graphql"
import { stripIndent } from "common-tags"

const feed = ({ Joi }) =>
  Joi.object({
    output: Joi.string().required(),
    query: Joi.string().required(),
    title: Joi.string().required(),
    serialize: Joi.func().required(),
    match: Joi.string(),
    link: Joi.string(),
  })
    .unknown(true)
    .external(({ query }) => {
      if (query) {
        try {
          parse(query)
        } catch (e) {
          throw new Error(
            stripIndent`
      Invalid plugin options for "gatsby-plugin-feed":
      "query" must be a valid GraphQL query. Received the error "${e.message}"`
          )
        }
      }
    })

export default ({ Joi }) =>
  Joi.object({
    generator: Joi.string(),
    query: Joi.string(),
    setup: Joi.func(),
    feeds: Joi.array().items(feed({ Joi })).required(),
  })
    .unknown(true)
    .external(({ query }) => {
      if (query) {
        try {
          parse(query)
        } catch (e) {
          throw new Error(
            stripIndent`
        Invalid plugin options for "gatsby-plugin-feed":
        "query" must be a valid GraphQL query. Received the error "${e.message}"`
          )
        }
      }
    })
