/* @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { useQuery } from "urql"
import { Spinner } from "theme-ui"
import { Heading, Text } from "gatsby-interface"

function Pages(): JSX.Element {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPage {
          nodes {
            path
            pluginCreator {
              name
            }
          }
        }
      }
    `,
  })

  if (fetching) return <Spinner />

  if (error) {
    const errMsg =
      (error.networkError && error.networkError.message) ||
      (Array.isArray(error.graphQLErrors) &&
        error.graphQLErrors.map(e => e.message).join(` | `))

    return <p>Error: {errMsg}</p>
  }

  return (
    <Flex gap={8} flexDirection="column" sx={{ paddingY: 7, paddingX: 6 }}>
      <Flex gap={6} flexDirection="column">
        <Heading as="h1" sx={{ fontWeight: `500`, fontSize: 5 }}>
          Pages
        </Heading>
        <ul sx={{ pl: 0, listStyle: `none` }}>
          {data.allGatsbyPage.nodes
            .filter(page => page.path.indexOf(`/dev-404-page/`) !== 0)
            .sort((a, b) => a.path.localeCompare(b.path))
            .map(page => (
              <li key={page.path} sx={{ p: 0 }}>
                <Flex
                  flexDirection="column"
                  gap={3}
                  sx={{
                    backgroundColor: `ui.background`,
                    padding: 5,
                    borderRadius: 2,
                  }}
                >
                  <Heading as="h3">{page.path}</Heading>
                  <Text sx={{ color: `text.secondary` }}>
                    Source: {page.pluginCreator.name}
                  </Text>
                </Flex>
              </li>
            ))}
        </ul>
      </Flex>
    </Flex>
  )
}

export default Pages
