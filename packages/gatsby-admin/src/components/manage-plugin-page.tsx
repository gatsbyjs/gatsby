/* @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { useMutation } from "urql"
import { useState, Fragment } from "react"
import {
  Button,
  TextAreaField,
  TextAreaFieldControl,
  Text,
  Heading,
  Spacer,
} from "gatsby-interface"
import { navigate } from "gatsby-link"

interface IProps {
  plugin: {
    name: string
    description?: string
    options?: Record<string, any>
  }
}

export default function ManagePluginForm({ plugin }: IProps): JSX.Element {
  const [{ fetching: updatingGatsbyPlugin }, updateGatsbyPlugin] = useMutation(`
    mutation updateGatsbyPlugin(
      $name: String!
      $options: JSONObject) {
      updateGatsbyPlugin(gatsbyPlugin: {
        name: $name,
        id: $name,
        options: $options
      }) {
        id
        name
        options
      }
    }
  `)
  const [{ fetching: deletingGatsbyPlugin }, deleteGatsbyPlugin] = useMutation(`
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

  const [options, setOptions] = useState(() =>
    JSON.stringify(plugin.options || {}, null, 2)
  )
  const [error, setError] = useState<Error | null>(null)

  return (
    <Fragment>
      <Spacer size={15} />
      <Flex gap={9} flexDirection="column" alignItems="flex-start">
        <Flex
          sx={{ width: `100%` }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading as="h1">{plugin.name}</Heading>
          <Button
            variant="GHOST"
            tone="DANGER"
            loading={deletingGatsbyPlugin}
            onClick={(evt): void => {
              evt.preventDefault()
              if (
                window.confirm(
                  `Are you sure you want to uninstall ${plugin.name}?`
                )
              ) {
                deleteGatsbyPlugin({ name: plugin.name }).then(() =>
                  navigate(`/`)
                )
              }
            }}
          >
            Uninstall
          </Button>
        </Flex>
        <Flex
          as="form"
          // @ts-ignore
          onSubmit={(evt: React.FormEvent): void => {
            evt.preventDefault()
            setError(null)
            let json
            try {
              // NOTE(@mxstbr): I use eval() to support JS object notation (`{ bla: true }`) and
              // not just strict JSON (`{ "bla": true }`)
              const js = eval(`(${options})`)
              // Validate that options isn't any JavaScript but an object
              json = JSON.parse(JSON.stringify(js))
            } catch (err) {
              setError(err)
              return
            }
            updateGatsbyPlugin({
              name: plugin.name,
              options: json,
            }).catch(err => {
              setError(err)
            })
          }}
          gap={5}
          alignItems="flex-start"
          flexDirection="column"
          sx={{
            borderRadius: 3,
            backgroundColor: `white`,
            borderColor: `grey.30`,
            borderWidth: 1,
            borderStyle: `solid`,
            padding: 7,
            width: `30%`,
          }}
        >
          <TextAreaField id="plugin-options">
            <Flex sx={{ width: `100%` }} gap={3} flexDirection="column">
              <Flex sx={{ width: `100%` }} gap={5} flexDirection="column">
                <Flex>
                  <Heading as="h3" sx={{ fontSize: 2 }}>
                    Configuration options
                  </Heading>
                </Flex>
                <TextAreaFieldControl
                  sx={{
                    fontFamily: `monospace`,
                    backgroundColor: `grey.70`,
                    color: `white`,
                    p: 5,
                    borderRadius: 3,
                    ...(error !== null
                      ? {
                          borderWidth: 1,
                          borderStyle: `solid`,
                          borderColor: `red.40`,
                        }
                      : {}),
                  }}
                  value={options}
                  onChange={(evt): void => setOptions(evt.target.value)}
                />
              </Flex>
              {error !== null && (
                <Text sx={{ color: `red.60`, fontSize: 0 }}>
                  Invalid JSON: {error.message}
                </Text>
              )}
            </Flex>
          </TextAreaField>
          <Button
            variant="PRIMARY"
            tone="BRAND"
            type="submit"
            loading={updatingGatsbyPlugin}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </Fragment>
  )
}
