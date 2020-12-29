import { wrapSchema, introspectSchema } from "@graphql-tools/wrap"
import { fetch } from "cross-fetch"
import { print } from "graphql"

async function execute({ document, variables }) {
  const query = print(document)

  const fetchResult = await fetch(
    process.env.GATSBY_EXPERIMENTAL_REMOTE_SCHEMA,
    {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
        Authorization: `Bearer ${process.env.GATSBY_EXPERIMENTAL_REMOTE_SCHEMA_TOKEN}`,
      },
      body: JSON.stringify({ query, variables }),
    }
  )
  return fetchResult.json()
}

export async function buildRemoteSchema() {
  const schema = wrapSchema({
    schema: await introspectSchema(execute),
    executor: execute,
  })
  return schema
}
