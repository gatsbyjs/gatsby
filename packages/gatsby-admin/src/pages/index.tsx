/** @jsx jsx */
import React, { Fragment } from "react"
import { jsx, Flex } from "strict-ui"
import { Spinner } from "theme-ui"
import { useQuery, useMutation } from "urql"
import {
  Heading,
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuItems,
  HeadingProps,
  Text,
  Badge,
  Spacer,
} from "gatsby-interface"
import PluginSearchBar from "../components/plugin-search"

const InstalledPluginListItem: React.FC<{
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
      as="li"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 3,
        px: 5,
        borderRadius: 2,
        "&:hover": { backgroundColor: `grey.10` },
      }}
    >
      <Heading as="h2" sx={{ fontWeight: `bold`, fontSize: 2 }}>
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
  )
}

const Subheading: React.FC<HeadingProps> = props => (
  <Heading as="h2" sx={{ fontWeight: `bold`, fontSize: 3 }} {...props} />
)

const Index: React.FC<{}> = () => {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPlugin {
          nodes {
            name
            id
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
    <Fragment>
      <Spacer size={9} />
      <Flex>
        <Flex flexDirection="column" gap={13} flex="1">
          <Flex gap={7} flexDirection="column">
            <Heading as="h1" sx={{ fontWeight: `800` }}>
              <div
                sx={{
                  color: `text.secondary`,
                  fontSize: 3,
                  fontWeight: `400`,
                  pb: 2,
                }}
              >
                Welcome to
              </div>
              <Flex alignItems="center" gap={3}>
                <span>Gatsby Admin</span>
                <Badge tone="NEUTRAL">alpha</Badge>
              </Flex>
            </Heading>
            <Text sx={{ color: `grey.80` }}>
              Gatsby Admin is your user interface for managing and extending
              your Gatsby site. Manage your installed plugins, themes, site
              metadata and more without touching your code editor.
            </Text>
          </Flex>
          <Flex gap={7} flexDirection="column">
            <Subheading>
              Installed plugins ({data.allGatsbyPlugin.nodes.length})
            </Subheading>
            <Flex
              as="ul"
              gap={3}
              flexDirection="column"
              sx={{ p: 0, listStyle: `none` }}
            >
              {data.allGatsbyPlugin.nodes.map(plugin => (
                <InstalledPluginListItem key={plugin.id} plugin={plugin} />
              ))}
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap={13} flex="1">
          <Flex flexDirection="column" gap={3}>
            <Subheading id="plugin-search-label">Search all plugins</Subheading>
            <Text sx={{ color: `grey.60` }}>
              One of the best ways to add functionality to a Gatsby site is
              through our plugin ecosystem. With 2000+ plugins, there’s probably
              one that does what you need— from SEO to image optimization to
              data sourcing and much more.
            </Text>
            <PluginSearchBar />
          </Flex>

          <Subheading>Recommended plugins</Subheading>
        </Flex>
      </Flex>
    </Fragment>
  )
}

export default Index
