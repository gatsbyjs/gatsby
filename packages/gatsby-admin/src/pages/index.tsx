/** @jsx jsx */
import { Fragment } from "react"
import { jsx, Flex } from "strict-ui"
import { Spinner } from "theme-ui"
import { useQuery } from "urql"
import { Link } from "gatsby"
import {
  Card,
  Heading,
  HeadingProps,
  Text,
  Badge,
  Spacer,
} from "gatsby-interface"
import skaterIllustration from "../skaterboi.svg"
import boltIcon from "../bolt.svg"
import sparklesIcon from "../sparkles.svg"
import PluginSearchBar from "../components/plugin-search"

function InstalledPluginListItem({
  plugin,
}: {
  plugin: { name: string; description?: string; options?: Record<string, any> }
}): JSX.Element {
  return (
    <Fragment>
      <Flex
        as="li"
        // NOTE(@mxstbr): This is an escape hatch from strict-ui. Gotta figure out how to cover this use case upstream...
        // @ts-ignore
        style={{
          width: `calc(100% + 2rem)`,
          marginLeft: `-1rem`,
        }}
      >
        <Flex
          as={Link}
          // NOTE(@mxstbr): TypeScript does not understand the as="" prop
          // @ts-ignore
          to={`/plugins/${plugin.name}`}
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background: `none`,
            border: `none`,
            borderRadius: 2,
            textDecoration: `none`,
            transition: `background-color 100ms ease-out`,
            "&:hover": {
              backgroundColor: `grey.10`,
              ".hover-move": {
                transform: `translateX(0.1em)`,
              },
            },
            width: `100%`,
            py: 3,
            px: 5,
          }}
        >
          <Heading as="h3" sx={{ fontWeight: `bold`, fontSize: 2 }}>
            {plugin.name}
          </Heading>
          <Text sx={{ color: `gatsby` }}>
            Manage{` `}
            <span
              className="hover-move"
              style={{
                display: `inline-block`,
              }}
              sx={{
                transition: `transform 100ms ease-out`,
              }}
            >
              -&gt;
            </span>
          </Text>
        </Flex>
      </Flex>
    </Fragment>
  )
}

function Subheading(props: HeadingProps): JSX.Element {
  return <Heading as="h2" sx={{ fontWeight: `bold`, fontSize: 3 }} {...props} />
}

function Index(): JSX.Element {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPlugin {
          nodes {
            options
            name
            id
          }
        }
      }
    `,
  })

  let errMsg: string | false = false

  if (error) {
    errMsg =
      (error.networkError && error.networkError.message) ||
      (Array.isArray(error.graphQLErrors) &&
        error.graphQLErrors.map(e => e.message).join(` | `))
  }

  return (
    <Fragment>
      {error && (
        <Fragment>
          <Spacer size={9} />
          <div
            sx={{
              p: 4,
              backgroundColor: `red.10`,
              border: (t: any): string => `1px solid ${t.colors.red[`80`]}`,
              borderRadius: 2,
            }}
          >
            <strong>Error:</strong> {errMsg}
          </div>
        </Fragment>
      )}
      <Spacer size={9} />
      <Flex gap={13}>
        <Flex flexDirection="column" gap={13} flex="1">
          <Flex gap={7} flexDirection="column">
            <Flex gap={6} alignItems="center">
              <img
                src={skaterIllustration}
                alt="Skater illustration with a Gatsby flag"
              />
              <Heading as="h1" sx={{ fontWeight: `800` }}>
                <div
                  sx={{
                    color: `grey.60`,
                    fontSize: 2,
                    fontWeight: `400`,
                    pb: 2,
                  }}
                >
                  Welcome to
                </div>
                <Flex alignItems="center" gap={3}>
                  <span>Gatsby Admin</span>
                  <Badge sx={{ backgroundColor: `blackFade.5` }} tone="NEUTRAL">
                    alpha
                  </Badge>
                </Flex>
              </Heading>
            </Flex>
            <Text sx={{ color: `grey.80` }}>
              Gatsby Admin is your user interface for managing and extending
              your Gatsby site. Manage your installed plugins, themes, site
              metadata and more without touching your code editor.
            </Text>
          </Flex>
          <Flex gap={7} flexDirection="column">
            <Flex alignItems="center" gap={3}>
              <img src={boltIcon} alt="" />
              <Subheading>
                Installed plugins{` `}
                {data?.allGatsbyPlugin?.nodes && (
                  <span
                    sx={{ fontSize: 1, color: `grey.60`, fontWeight: `400` }}
                  >
                    ({data.allGatsbyPlugin.nodes.length})
                  </span>
                )}
              </Subheading>
            </Flex>
            {data?.allGatsbyPlugin?.nodes ? (
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
            ) : (
              <Spinner />
            )}
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap={13} flex="1">
          <Flex flexDirection="column" gap={5}>
            <Subheading id="plugin-search-label">Search all plugins</Subheading>
            <Text sx={{ color: `grey.60` }}>
              One of the best ways to add functionality to a Gatsby site is
              through our plugin ecosystem. With 2000+ plugins, there’s probably
              one that does what you need— from SEO to image optimization to
              data sourcing and much more.
            </Text>
            <PluginSearchBar />
          </Flex>

          <Flex flexDirection="column" gap={5}>
            <Flex alignItems="center" gap={3}>
              <img src={sparklesIcon} alt="" />
              <Subheading>Recommended plugins</Subheading>
            </Flex>
            <Card>
              <Flex sx={{ p: 9 }} justifyContent="center" alignItems="center">
                <Heading as="h3" sx={{ fontWeight: `bold`, fontSize: 2 }}>
                  Coming soon!
                </Heading>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Flex>
    </Fragment>
  )
}

export default Index
