/* @jsx jsx */
import { jsx, Flex } from "strict-ui"
import { PageProps } from "gatsby"
import { useQuery } from "urql"
import { Spinner } from "theme-ui"
import { Global } from "@emotion/react"
import { useMutation } from "urql"
import { useState, Fragment, useEffect, FormEvent } from "react"
import {
  AnchorButton,
  Button,
  TextAreaField,
  TextAreaFieldControl,
  Text,
  Heading,
  Spacer,
} from "gatsby-interface"
import { navigate } from "gatsby-link"
import { FaUsers as CommunityIcon } from "react-icons/fa"
import { MdArrowDownward as ArrowDownwardIcon } from "react-icons/md"
import ReactMarkdown from "react-markdown"
import Highlight, { defaultProps } from "prism-react-renderer"
import useNpmPackageData from "../utils/use-npm-data"
import prismThemeCss from "../prism-theme"
import gitHubIcon from "../github.svg"
import isOfficialPackage from "../utils/is-official-package"
import GatsbyIcon from "../components/gatsby-monogram"
import { useTelemetry } from "../utils/use-telemetry"

const markdownRenderers = {
  paragraph: (props: any): JSX.Element => (
    <Text as="p" {...props} sx={{ color: `text.primary` }} />
  ),
  heading: (props: any): JSX.Element => (
    <Heading as={`h${props.level}`} {...props} />
  ),
  inlineCode: (props: any): JSX.Element => (
    <Text
      // @ts-ignore
      as="code"
      sx={{
        fontFamily: `monospace`,
      }}
      {...props}
    />
  ),
  code: (props: any): JSX.Element => (
    <Highlight
      {...defaultProps}
      // The theme is provided via CSS, not prism-react-renderer's custom theming system
      theme={undefined}
      code={props.value}
      language={props.language}
    >
      {({
        className,
        style,
        tokens,
        getLineProps,
        getTokenProps,
      }): JSX.Element => (
        <Text
          // @ts-ignore
          as="pre"
          sx={{
            fontFamily: `monospace`,
            fontSize: 0,
          }}
          className={className}
          style={style}
        >
          {tokens.map((line, i) => (
            // eslint-disable-next-line react/jsx-key
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                // eslint-disable-next-line react/jsx-key
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </Text>
      )}
    </Highlight>
  ),
}

export default function PluginView(
  props: PageProps & {
    // This is the subpath, gatsby-plugin-create-client-paths is configured to match /plugins/*
    "*": string
  }
): JSX.Element {
  const pluginName = props[`*`]

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
      id: pluginName,
    },
  })

  const { fetching: fetchingNpmData, data: npmData } = useNpmPackageData(
    pluginName
  )

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

  const [
    { fetching: installingGatsbyPlugin },
    installGatsbyPlugin,
  ] = useMutation(`
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
        description
        options
        readme
      }
    }
  `)

  const [options, setOptions] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<Error | null>(null)
  const isInstalled = !fetching && !!data?.gatsbyPlugin?.name
  const isOfficial = !fetchingNpmData && npmData && isOfficialPackage(npmData)

  useEffect(() => {
    if (fetching) return

    setOptions(
      JSON.stringify(data?.gatsbyPlugin?.options || {}, null, 2).replace(
        `{}`,
        `{\n  \n}`
      )
    )
  }, [fetching])

  const telemetry = useTelemetry()

  if (error) {
    const errMsg =
      (error.networkError && error.networkError.message) ||
      (Array.isArray(error.graphQLErrors) &&
        error.graphQLErrors.map(e => e.message).join(` | `))

    return <p>Error: {errMsg}</p>
  }

  return (
    <Fragment>
      <Spacer size={15} />
      <Global styles={prismThemeCss} />
      <Flex gap={9} flexDirection="column" alignItems="flex-start">
        <Flex flexDirection="column" gap={2} sx={{ width: `100%` }}>
          <Flex gap={5}>
            <Text
              sx={{ color: `grey.60`, fontSize: 1, whiteSpace: `pre-wrap` }}
            >
              {fetchingNpmData ? (
                ``
              ) : isOfficial ? (
                <span>
                  <GatsbyIcon /> Official
                </span>
              ) : (
                <span>
                  <CommunityIcon /> Community
                </span>
              )}
              {` `}
              Gatsby plugin
            </Text>
            {}
            <Text
              sx={{ color: `grey.60`, fontSize: 1, whiteSpace: `pre-wrap` }}
            >
              <ArrowDownwardIcon /> {npmData?.humanDownloadsLast30Days || `...`}
              {` `}
              downloads
            </Text>
          </Flex>
          <Flex
            sx={{ width: `100%` }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading as="h1">{pluginName}</Heading>
            <Flex gap={3}>
              <AnchorButton
                variant="SECONDARY"
                size="M"
                target="_blank"
                // Fall back to https://github.com/nice-registry/ghub.io, which redirects to the
                // package.json repository url automatically
                href={
                  npmData?.repository?.url || `https://ghub.io/${pluginName}`
                }
                sx={{
                  // Render the space between the text and the <img> icon
                  whiteSpace: `pre`,
                }}
              >
                View on GitHub <img src={gitHubIcon} alt="" />
              </AnchorButton>
              {fetching ? (
                <Spinner />
              ) : isInstalled ? (
                <Button
                  variant="GHOST"
                  tone="DANGER"
                  size="M"
                  loading={deletingGatsbyPlugin}
                  onClick={(evt): void => {
                    evt.preventDefault()
                    if (
                      window.confirm(
                        `Are you sure you want to uninstall ${pluginName}?`
                      )
                    ) {
                      telemetry.trackEvent(`PLUGIN_UNINSTALL`, {
                        pluginName,
                      })
                      deleteGatsbyPlugin({ name: pluginName }).then(() =>
                        navigate(`/`)
                      )
                    }
                  }}
                >
                  Uninstall
                </Button>
              ) : (
                <Button
                  size="M"
                  loading={installingGatsbyPlugin}
                  onClick={(evt): void => {
                    evt.preventDefault()
                    installGatsbyPlugin({ name: pluginName })
                    telemetry.trackEvent(`PLUGIN_INSTALL`, {
                      pluginName,
                    })
                  }}
                >
                  Install
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={12} sx={{ width: `100%` }} alignItems="flex-start">
          <div sx={{ width: `70%` }}>
            {fetchingNpmData ? (
              <Spinner />
            ) : npmData?.readme ? (
              <Flex gap={5} flexDirection="column">
                <ReactMarkdown
                  renderers={markdownRenderers}
                  source={npmData.readme.replace(
                    // Remove the first heading with the plugin name since we render that manually
                    new RegExp(`(?:#+|^)\\s*${pluginName}$`, `m`),
                    ``
                  )}
                />
              </Flex>
            ) : (
              `No readme found.`
            )}
          </div>
          <Flex
            as="form"
            // @ts-ignore
            onSubmit={(evt: FormEvent): void => {
              evt.preventDefault()
              setValidationError(null)
              let json
              try {
                // NOTE(@mxstbr): I use eval() to support JS object notation (`{ bla: true }`) and
                // not just strict JSON (`{ "bla": true }`)
                const js = eval(`(${options})`)
                // Validate that options isn't any JavaScript but an object
                json = JSON.parse(JSON.stringify(js))
              } catch (err) {
                setValidationError(err)
                return
              }
              telemetry.trackEvent(`PLUGIN_CONFIGURE`, {
                pluginName,
              })
              updateGatsbyPlugin({
                name: props[`*`],
                options: json,
              }).catch(err => {
                setValidationError(err)
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
                  <Flex gap={2} flexDirection="column">
                    <Heading as="h3" sx={{ fontSize: 2 }}>
                      Configuration options
                    </Heading>
                    <Text sx={{ color: `grey.60`, fontSize: 1 }}>
                      After installing this plugin, you can configure it here.
                      Changes made here are applied to the gatsby-config.js
                      file.
                    </Text>
                  </Flex>
                  {options === null ? (
                    <Spinner />
                  ) : (
                    <TextAreaFieldControl
                      sx={{
                        fontFamily: `monospace`,
                        backgroundColor: `grey.70`,
                        color: `white`,
                        p: 5,
                        borderRadius: 3,
                        minHeight: `10em`,
                        ...(validationError !== null
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
                  )}
                </Flex>
                {validationError !== null && (
                  <Text sx={{ color: `red.60`, fontSize: 0 }}>
                    Invalid JSON: {validationError.message}
                  </Text>
                )}
              </Flex>
            </TextAreaField>
            <Flex alignItems="center" gap={3}>
              <Button
                variant="PRIMARY"
                tone="BRAND"
                type="submit"
                size="M"
                loading={updatingGatsbyPlugin}
                disabled={!isInstalled}
              >
                Save
              </Button>
              {!isInstalled && (
                <Text sx={{ fontSize: 0, color: `grey.50` }}>
                  Install this plugin in order to save
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Fragment>
  )
}
