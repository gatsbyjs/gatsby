/* @jsx jsx */
import { jsx } from "strict-ui"
import { PageProps } from "gatsby"
import { useQuery } from "urql"
import { Spinner } from "theme-ui"
import ManagePluginForm from "../components/manage-plugin-page"
import useNpmPackageData from "../utils/use-npm-data"

export default function PluginView(
  props: PageProps & {
    // This is the subpath, gatsby-plugin-create-client-paths is configured to match /plugins/*
    "*": string
  }
): JSX.Element {
  const [{ data, fetching, error }] = useQuery({
    query: `
      query GetGatsbyPlugin($id: String!) {
        gatsbyPlugin(id: $id) {
          name
          description
          options
        }
      }
    `,
    variables: {
      id: props[`*`],
    },
  })

  if (fetching) return <Spinner />

  if (error) {
    const errMsg =
      (error.networkError && error.networkError.message) ||
      (Array.isArray(error.graphQLErrors) &&
        error.graphQLErrors.map(e => e.message).join(` | `))

    return <p>Error: {errMsg}</p>
  }

  if (!data?.gatsbyPlugin?.name)
    return <h1>You do not have {props[`*`]} installed.</h1>

  return <ManagePluginForm plugin={data.gatsbyPlugin} />
}
