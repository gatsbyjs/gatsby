/** @jsx jsx */
import React from "react"
import { jsx, Flex, Grid } from "strict-ui"
import { useQuery, useMutation } from "urql"
import {
  Heading,
  HeadingProps,
  Text,
  Button,
  InputField,
  InputFieldControl,
} from "gatsby-interface"

const InstallInput: React.FC<{}> = () => {
  const [value, setValue] = React.useState(``)

  const [, installGatbyPlugin] = useMutation(`
    mutation installGatsbyPlugin($name: String!) {
      createNpmPackage(npmPackage: {
        name: $name,
        dependencyType: "production"
      }) {
        id
        name
      }
      createGatsbyPlugin(gatsbyPlugin: {
        name: $name
      }) {
        id
        name
      }
    }
  `)

  return (
    <form
      onSubmit={(evt): void => {
        evt.preventDefault()
        installGatbyPlugin({
          name: value,
        })
      }}
    >
      <InputField id="install-plugin">
        <InputFieldControl
          placeholder="gatsby-plugin-feed"
          value={value}
          onChange={(e): void => setValue(e.target.value)}
          sx={{
            backgroundColor: `background`,
            borderColor: `grey.60`,
            color: `white`,
            width: `initial`,
            "&:focus": {
              borderColor: `grey.40`,
              // TODO(@mxstbr): Fix this focus outline
              boxShadow: `none`,
            },
          }}
        />
      </InputField>
    </form>
  )
}

const DestroyButton: React.FC<{ name: string }> = ({ name }) => {
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
    <Button
      variant="SECONDARY"
      size="S"
      sx={{
        paddingX: 5,
        paddingY: 4,
        color: `white`,
      }}
      onClick={(evt): void => {
        evt.preventDefault()
        deleteGatsbyPlugin({ name })
      }}
    >
      Uninstall
    </Button>
  )
}

const SectionHeading: React.FC<HeadingProps> = props => (
  <Heading sx={{ color: `white`, fontWeight: `500` }} {...props} />
)

const PluginCard: React.FC<{ name: string }> = ({ name }) => (
  <Flex
    flexDirection="column"
    gap={7}
    sx={{ backgroundColor: `grey.80`, padding: 5, borderRadius: 2 }}
  >
    <Text size="L" sx={{ color: `white`, fontWeight: `500` }}>
      {name}
    </Text>
    <Text sx={{ color: `grey.40` }}>
      Start setting up your sites styles with one of our curated recipes to
      write styling the way you love. Choose from libraries like theme-UI,
      emotion, and styled-components.
    </Text>
    <Flex justifyContent="flex-end" sx={{ width: `100%` }}>
      <DestroyButton name={name} />
    </Flex>
  </Flex>
)

const Index: React.FC<{}> = () => {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPlugin {
          nodes {
            name
            id
            shadowedFiles
            shadowableFiles
          }
        }
      }
    `,
  })

  if (fetching) return <p>Loading...</p>

  if (error) return <p>Oops something went wrong.</p>

  return (
    <Flex gap={7} flexDirection="column" sx={{ paddingY: 7, paddingX: 6 }}>
      <SectionHeading>Plugins</SectionHeading>
      <Grid gap={6} columns={[1, 1, 2, 3]}>
        {data.allGatsbyPlugin.nodes
          .filter(plugin => plugin.name.indexOf(`gatsby-plugin`) === 0)
          .map(plugin => (
            <PluginCard key={plugin.id} name={plugin.name} />
          ))}
      </Grid>
      <InstallInput />

      <SectionHeading>Themes</SectionHeading>
      <Grid gap={6} columns={[1, 1, 2, 3]}>
        {data.allGatsbyPlugin.nodes
          .filter(plugin => plugin.name.indexOf(`gatsby-theme`) === 0)
          .map(plugin => (
            <PluginCard key={plugin.id} name={plugin.name} />
          ))}
      </Grid>

      <InstallInput />
    </Flex>
  )
}

export default Index
