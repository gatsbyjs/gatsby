import React, { useState, useEffect } from "react"
import SelectInput from "ink-select-input"
import { render, Box, Text, useInput, useApp, Transform } from "ink"
import Spinner from "ink-spinner"
import StepRenderer from "../components/step-renderer"
import hicat from "hicat"
import { trackCli } from "gatsby-telemetry"
import {
  useResource,
  useResourceByUUID,
  ResourceProvider,
} from "../renderer/resource-provider"
import terminalLink from "terminal-link"
import PropTypes from "prop-types"
import {
  createClient,
  useMutation,
  useSubscription,
  Provider,
  defaultExchanges,
  subscriptionExchange,
} from "urql"
import { SubscriptionClient } from "subscriptions-transport-ws"
import fetch from "node-fetch"
import ws from "ws"
import semver from "semver"
import remove from "unist-util-remove"
import recipesList from "../recipes-list"

const removeJsx = () => tree => {
  remove(tree, `export`, () => true)
  return tree
}

// Inline ink-link as it's not upgraded to v3 yet
const Link = props => (
  <Transform
    transform={children =>
      terminalLink(children, props.url, { fallback: props.fallback })
    }
  >
    <Text>{props.children}</Text>
  </Transform>
)

Link.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  url: PropTypes.string,
  fallback: PropTypes.bool,
}

Link.defaultProps = {
  url: ``,
  fallback: true,
}

// Check for what version of React is loaded & warn if it's too low.
if (semver.lt(React.version, `16.8.0`)) {
  console.log(
    `Recipes works best with newer versions of React. Please file a bug report if you see this warning.`
  )
}

const WelcomeMessage = () => (
  <>
    <Box
      borderStyle="double"
      borderColor="magentaBright"
      padding={1}
      marginBottom={1}
      marginLeft={2}
      marginRight={2}
    >
      <Text>
        Thank you for trying the experimental version of Gatsby Recipes!
      </Text>
    </Box>
    <Div marginBottom={2} alignItems="center">
      <Text>
        Please ask questions, share your recipes, report bugs, and subscribe for
        updates in our umbrella issue at
        https://github.com/gatsbyjs/gatsby/issues/22991
      </Text>
    </Div>
  </>
)

const RecipesList = ({ setRecipe }) => {
  const items = recipesList

  return (
    <SelectInput
      items={items}
      onSelect={setRecipe}
      indicatorComponent={item => (
        <Text color={item.isSelected ? `yellow` : `magentaBright`}>
          {item.isSelected ? `>>` : `  `}
          {item.label}
        </Text>
      )}
      itemComponent={props => (
        <Text color="magentaBright">
          {props.isSelected}
          {` `}
          {props.label}
        </Text>
      )}
    />
  )
}

const Div = props => (
  <Box textWrap="wrap" flexDirection="column" marginBottom={1} {...props} />
)

// Markdown ignores new lines and so do we.
function eliminateNewLines(children) {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child.replace(/(\r\n|\n|\r)/gm, ` `)
    }

    if (child.props.children) {
      child = React.cloneElement(child, {
        children: eliminateNewLines(child.props.children),
      })
    }

    return child
  })
}

const ResourceComponent = props => {
  let resource
  if (props._key) {
    resource = useResource(props._key)
  } else {
    resource = useResourceByUUID(props._uuid)
  }

  return (
    <Div marginBottom={1}>
      <Text color="yellow" backgroundColor="black" bold underline>
        {resource.resourceName}:
      </Text>
      <Text color="green">{resource?.describe}</Text>
      {resource?.diff ? (
        <>
          <Text>{` `}</Text>
          <Text>{resource?.diff}</Text>
        </>
      ) : null}
      {resource?.error ? (
        <>
          <Text>{` `}</Text>
          <Text backgroundColor="#C41E3A" color="white">
            {resource?.error}
          </Text>
        </>
      ) : null}
    </Div>
  )
}

const components = {
  inlineCode: props => <Text>`{props.children}`</Text>,
  pre: props => <Div {...props} />,
  code: props => {
    // eslint-disable-next-line
    let language = "```"
    if (props.className) {
      // eslint-disable-next-line
      language = props.className.split(`-`)[1]
    }
    const children = hicat(props.children.trim(), { lang: language })

    const ansi = `\`\`\`${language}\n${children.ansi}\n\`\`\``

    return (
      <Div marginBottom={1}>
        <Text>{ansi}</Text>
      </Div>
    )
  },
  h1: props => (
    <Box marginBottom={1}>
      <Text bold underline {...props} />
    </Box>
  ),
  h2: props => <Text bold {...props} />,
  h3: props => <Text bold italic {...props} />,
  h4: props => <Text bold {...props} />,
  h5: props => <Text bold {...props} />,
  h6: props => <Text bold {...props} />,
  a: ({ href, children }) => <Link url={href}>{children}</Link>,
  strong: props => <Text bold {...props} />,
  em: props => <Text italic {...props} />,
  p: props => {
    const children = eliminateNewLines(props.children)
    return (
      <Div>
        <Text>{children}</Text>
      </Div>
    )
  },
  ul: props => <Div marginBottom={1}>{props.children}</Div>,
  li: props => <Text>* {props.children}</Text>,
  Config: () => null,
  GatsbyPlugin: props => <ResourceComponent {...props} />,
  NPMPackageJson: props => <ResourceComponent {...props} />,
  NPMPackage: props => <ResourceComponent {...props} />,
  File: props => <ResourceComponent {...props} />,
  Directory: props => <ResourceComponent {...props} />,
  GatsbyShadowFile: () => null,
  NPMScript: props => <ResourceComponent {...props} />,
  RecipeIntroduction: props => <Div {...props} />,
  RecipeStep: props => {
    const children = React.Children.toArray(props.children)
    const firstChild = children.shift()
    children.unshift(
      <Box key="header" flexDirection="row">
        <Text>
          {props.step}){` `}
        </Text>
        {firstChild}
      </Box>
    )

    return (
      <Div>
        <Box
          borderStyle="single"
          padding={1}
          flexDirection="column"
          borderColor="magentaBright"
        >
          {children}
        </Box>
      </Div>
    )
  },
  div: props => <Div {...props} />,
}

export default async ({
  recipe,
  isDevelopMode,
  isInstallMode,
  graphqlPort,
  projectRoot,
}) => {
  try {
    const GRAPHQL_ENDPOINT = `http://localhost:${graphqlPort}/graphql`

    const subscriptionClient = new SubscriptionClient(
      `ws://localhost:${graphqlPort}/graphql`,
      {
        reconnect: true,
      },
      ws
    )

    let showRecipesList = false

    if (!recipe) {
      showRecipesList = true
    }

    const client = createClient({
      fetch,
      url: GRAPHQL_ENDPOINT,
      exchanges: [
        ...defaultExchanges,
        subscriptionExchange({
          forwardSubscription(operation) {
            return subscriptionClient.request(operation)
          },
        }),
      ],
    })
    const Plan = ({ state, localRecipe, isDevelopMode }) => {
      const { exit } = useApp()
      // Exit the app after we render
      useEffect(() => {
        if (!isDevelopMode) {
          exit()
        }
      }, [])

      return (
        <>
          <ResourceProvider
            // Exclude inputs as they are components (so "plans" currrently
            // (we need to cleanup our names) too like resources which is why we
            // exclude them. The input from the inputs (haha) are ignored unless
            // they're passed as props into a resource component in which case
            // they're validated like normal.
            value={
              state.context.plan?.filter(p => p.resourceName !== `Input`) || []
            }
          >
            <WelcomeMessage />
            {isDevelopMode ? (
              <Box flexDirection="column" marginBottom={2}>
                <Text strong underline>
                  DEVELOP MODE
                </Text>
              </Box>
            ) : null}
            {state.context.stepsAsJS.map((step, i) => (
              <StepRenderer
                key={`step-${i}`}
                components={components}
                remarkPlugins={[removeJsx]}
              >
                {state.context.exports?.join(`\n`) + `\n\n` + step}
              </StepRenderer>
            ))}

            <Text>{`\n------\n`}</Text>
            <Text color="yellow">To install this recipe, run:</Text>
            <Text>{` `}</Text>
            <Text>
              {`  `}gatsby recipes {localRecipe} --install
            </Text>
            <Text>{` `}</Text>
          </ResourceProvider>
        </>
      )
    }

    const Installing = ({ state }) => (
      <Div>
        {state.context.plan.map((p, i) => (
          <Box
            textWrap="wrap"
            flexDirection="column"
            key={`${p.resourceName}-${i}`}
          >
            <Text>
              {p.isDone ? `✔ ` : <Spinner />}
              {` `}
              <Text italic>{p.resourceName}:</Text>
              {` `}
              {p.isDone ? p._message : p.describe}
              {` `}
              {state.context.elapsed > 0 && (
                <Text>({state.context.elapsed / 1000}s elapsed)</Text>
              )}
            </Text>
          </Box>
        ))}
      </Div>
    )

    let sentContinue = false
    const RecipeInterpreter = () => {
      const { exit } = useApp()
      // eslint-disable-next-line
      const [localRecipe, setRecipe] = useState(recipe)

      const [subscriptionResponse] = useSubscription(
        {
          query: `
          subscription {
            operation {
              state
            }
          }
        `,
        },
        (_prev, now) => now
      )

      // eslint-disable-next-line
      const [_, createOperation] = useMutation(`
        mutation ($recipePath: String!, $projectRoot: String!, $isDevelopMode: Boolean!) {
          createOperation(recipePath: $recipePath, projectRoot: $projectRoot, watchChanges: $isDevelopMode)
        }
      `)
      // eslint-disable-next-line
      const [__, _sendEvent] = useMutation(`
        mutation($event: String!, $input: String) {
          sendEvent(event: $event, input: $input)
        }
      `)

      const sendEvent = ({ event, input }) => {
        if (input) {
          _sendEvent({
            event,
            input: JSON.stringify(input),
          })
        } else {
          _sendEvent({ event })
        }
      }

      subscriptionClient.connectionCallback = async () => {
        if (!showRecipesList) {
          try {
            await createOperation({
              recipePath: localRecipe,
              projectRoot,
              isDevelopMode,
            })
          } catch (e) {
            console.log(`error creating operation`, e)
          }
        }
      }

      const state =
        subscriptionResponse.data &&
        JSON.parse(subscriptionResponse.data.operation.state)

      useInput((_, key) => {
        if (showRecipesList) {
          return
        }
        if (key.return) {
          sendEvent({ event: `CONTINUE` })
        }
      })

      if (showRecipesList) {
        return (
          <>
            <WelcomeMessage />
            <Text bold underline>
              Select a recipe to run
            </Text>
            <RecipesList
              setRecipe={async recipeItem => {
                if (recipeItem.value.endsWith(`.mdx`)) {
                  setRecipe(recipeItem.value.slice(0, -4))
                } else {
                  setRecipe(recipeItem.value)
                }
                trackCli(`RECIPE_RUN`, { name: recipeItem.value })
                showRecipesList = false
                try {
                  await createOperation({
                    recipePath: recipeItem.value,
                    projectRoot,
                    isDevelopMode: false,
                  })
                } catch (e) {
                  console.log(`error creating operation`, e)
                }
              }}
            />
          </>
        )
      }

      const ValidationErrors = state => {
        if (state.context?.plan) {
          return (
            <>
              <Text bold>
                The recipe didn't validate. Please fix the following errors:
              </Text>
              <Text>{`\n`}</Text>
              {state.context.plan
                .filter(p => p.error)
                .map((p, i) => (
                  <ResourceComponent key={i} {...p} />
                ))}
            </>
          )
        } else return null
      }

      const GeneralError = ({ state }) => {
        let errors = []
        if (state.context.error) {
          errors = Array.isArray(state.context.error.error)
            ? state.context.error.error
            : [state.context.error.error]
        } else {
          // Errors are on a plan.
          errors = state.context.plan?.filter(p => p.error)
        }
        if (errors.length > 0) {
          return (
            <>
              <Text bold>The recipe has an error:</Text>
              <Text>{`\n`}</Text>
              {errors.map((error, i) => (
                <Text key={i} backgroundColor="#C41E3A" color="white">
                  {error.error}
                </Text>
              ))}
            </>
          )
        } else return null
      }

      if (state?.value === `doneError`) {
        process.nextTick(() => process.exit())
        return (
          <ResourceProvider
            value={
              state.context.plan?.filter(p => p.resourceName !== `Input`) || []
            }
          >
            <ValidationErrors />
            <GeneralError state={state} />
          </ResourceProvider>
        )
      }

      let isReady

      // If installing, continue from presentPlan to applyingPlan
      if (state?.value === `presentPlan` && isInstallMode) {
        if (!sentContinue) {
          sendEvent({ event: `CONTINUE` })
          sentContinue = true
        }
      }

      // install mode
      if (isInstallMode) {
        isReady = state?.value === `applyingPlan` || state?.value === `done`
      } else {
        isReady = state?.value === `presentPlan`
      }

      if (!isReady) {
        return (
          <Text>
            <Spinner /> Loading recipe
          </Text>
        )
      }

      const isDone = state.value === `done`

      if (isDone) {
        process.nextTick(() => {
          subscriptionClient.close()
          exit()
          process.stdout.write(
            `\n\n---\n\n\nThe recipe finished successfully!\n\n`
          )
          process.exit()
        })
        // return null
      }

      if (isInstallMode) {
        return <Installing state={state} />
      } else {
        return (
          <Plan
            state={state}
            localRecipe={localRecipe}
            isDevelopMode={isDevelopMode}
          />
        )
      }
    }

    const Wrapper = () => (
      <>
        <Provider value={client}>
          <Text>{` `}</Text>
          <RecipeInterpreter />
        </Provider>
      </>
    )

    const Recipe = () => <Wrapper />

    // Enable experimental mode for more efficient reconciler and renderer
    const { waitUntilExit } = render(<Recipe />, { experimental: true })
    await waitUntilExit()
  } catch (e) {
    console.log(e)
  }
}
