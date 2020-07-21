/** @jsx jsx */
import React from "react"
import { jsx, Flex, Grid } from "strict-ui"
import { Spinner } from "theme-ui"
import { useQuery, useMutation } from "urql"
import {
  Heading,
  HeadingProps,
  Text,
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuItems,
} from "gatsby-interface"
import PluginSearchBar from "../components/plugin-search"

const SectionHeading: React.FC<HeadingProps> = props => (
  <Heading as="h1" sx={{ fontWeight: `500`, fontSize: 5 }} {...props} />
)

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
      gap={6}
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
        allGatsbyPage {
          nodes {
            path
          }
        }
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

  if (error) return <p>Oops something went wrong.</p>

  return (
    <Flex gap={7} flexDirection="column" sx={{ paddingY: 7, paddingX: 6 }}>
      <SectionHeading>Pages</SectionHeading>
      <ul sx={{ pl: 0, listStyle: `none` }}>
        {data.allGatsbyPage.nodes
          .filter(page => page.path.indexOf(`/dev-404-page/`) !== 0)
          .sort((a, b) => a.path.localeCompare(b.path))
          .map(page => (
            <li
              key={page.path}
              sx={{
                py: 1,
              }}
            >
              {page.path}
            </li>
          ))}
      </ul>

      <SectionHeading id="plugin-search-label">
        Installed Plugins
      </SectionHeading>
      <Grid gap={6} columns={[1, 1, 1, 2, 3]}>
        {data.allGatsbyPlugin.nodes.map(plugin => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </Grid>
      <PluginSearchBar />
    </Flex>
  )
}

export default Index
