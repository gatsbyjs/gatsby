/** @jsx jsx */
import React from "react"
import { jsx, Flex, Grid } from "strict-ui"
import { Spinner } from "theme-ui"
import { useQuery, useMutation } from "urql"
import {
  Heading,
  Text,
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuItems,
} from "gatsby-interface"
import PluginSearchBar from "../components/plugin-search"

const PluginCard: React.FC<{
  plugin: { name: string; description?: string }
}> = ({ plugin }) => {
  const [, deleteGatsbyPlugin] = useMutation(`
    mutation destroyGatsbyPlugin($name: String!) {
      destroyNpmPackage(npmPackage: {
        name: $name,
        id: $name,
        dependencyType: "production"
      }) {
        id
        name
      }
      destroyGatsbyPlugin(gatsbyPlugin: {
        name: $name,
        id: $name
      }) {
        id
        name
      }
    }
  `)

  return (
    <Flex
      flexDirection="column"
      gap={3}
      sx={{ backgroundColor: `ui.background`, padding: 5, borderRadius: 2 }}
    >
      <Flex justifyContent="space-between">
        <Heading as="h2" sx={{ fontWeight: `500`, fontSize: 3 }}>
          {plugin.name}
        </Heading>
        <DropdownMenu>
          <DropdownMenuButton
            aria-label="Actions"
            sx={{
              border: `none`,
              background: `transparent`,
              color: `text.secondary`,
            }}
          >
            ···
          </DropdownMenuButton>
          <DropdownMenuItems>
            <DropdownMenuItem
              onSelect={(): void => {
                if (
                  window.confirm(`Are you sure you want to uninstall ${name}?`)
                ) {
                  deleteGatsbyPlugin({ name })
                }
              }}
            >
              Uninstall
            </DropdownMenuItem>
          </DropdownMenuItems>
        </DropdownMenu>
      </Flex>
      <Text sx={{ color: `text.secondary` }}>
        {plugin.description || <em>No description.</em>}
      </Text>
    </Flex>
  )
}

const Index: React.FC<{}> = () => {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPlugin {
          nodes {
            name
            description
            id
            shadowedFiles
            shadowableFiles
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
        <Heading
          as="h1"
          sx={{ fontWeight: `500`, fontSize: 5 }}
          id="plugin-search-label"
        >
          Installed Plugins
        </Heading>
        <Grid gap={6} columns={[1, 1, 1, 2, 3]}>
          {data.allGatsbyPlugin.nodes.map(plugin => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
        </Grid>
        <PluginSearchBar />
      </Flex>
    </Flex>
  )
}

export default Index
