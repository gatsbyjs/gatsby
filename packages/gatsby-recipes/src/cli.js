const fs = require(`fs`)
const lodash = require(`lodash`)
const Boxen = require(`ink-box`)
const React = require(`react`)
const { useState } = require(`react`)
const { render, Box, Text, Color, useInput, useApp, Static } = require(`ink`)
const Spinner = require(`ink-spinner`).default
const Link = require(`ink-link`)
const MDX = require(`@mdx-js/runtime`)
const hicat = require(`hicat`)
import { trackCli } from "gatsby-telemetry"
const {
  createClient,
  useMutation,
  useSubscription,
  Provider,
  defaultExchanges,
  subscriptionExchange,
} = require(`urql`)
const { SubscriptionClient } = require(`subscriptions-transport-ws`)
const fetch = require(`node-fetch`)
const ws = require(`ws`)
const SelectInput = require(`ink-select-input`).default
const semver = require(`semver`)

const MAX_UI_WIDTH = 67

// TODO try this and write out success stuff & last message?
// const enterAltScreenCommand = "\x1b[?1049h"
// const leaveAltScreenCommand = "\x1b[?1049l"
// process.stdout.write(enterAltScreenCommand)
// process.on("exit", () => {
// process.stdout.write(leaveAltScreenCommand)
// })

// Check for what version of React is loaded & warn if it's too low.
if (semver.lt(React.version, `16.8.0`)) {
  console.log(
    `Recipes works best with newer versions of React. Please file a bug report if you see this warning.`
  )
}

const WelcomeMessage = () => (
  <>
    <Boxen
      borderStyle="double"
      borderColor="magentaBright"
      float="left"
      padding={1}
      margin={{ bottom: 1, left: 2 }}
    >
      Thank you for trying the experimental version of Gatsby Recipes!
    </Boxen>
    <Div marginBottom={2} alignItems="center">
      Please ask questions, share your recipes, report bugs, and subscribe for
      updates in our umbrella issue at
      https://github.com/gatsbyjs/gatsby/issues/22991
    </Div>
  </>
)

const RecipesList = ({ setRecipe }) => {
  const items = [
    {
      label: `Add a custom ESLint config`,
      value: `eslint.mdx`,
    },
    {
      label: `Add Jest`,
      value: `jest.mdx`,
    },
    // Waiting on joi2graphql support for Joi.object().unknown()
    // with a JSON type.
    // {
    // label: "Automatically run Prettier on commits",
    // value: "prettier-git-hook.mdx",
    // },
    {
      label: `Add Gatsby Theme Blog`,
      value: `gatsby-theme-blog`,
    },
    {
      label: `Add Gatsby Theme Blog Core`,
      value: `gatsby-theme-blog-core`,
    },
    {
      label: `Add Gatsby Theme Notes`,
      value: `gatsby-theme-notes`,
    },
    {
      label: `Add persistent layout component with gatsby-plugin-layout`,
      value: `gatsby-plugin-layout`,
    },
    {
      label: `Add Theme UI`,
      value: `theme-ui.mdx`,
    },
    {
      label: `Add Emotion`,
      value: `emotion.mdx`,
    },
    {
      label: `Add support for MDX Pages`,
      value: `mdx-pages.mdx`,
    },
    {
      label: `Add support for MDX Pages with images`,
      value: `mdx-images.mdx`,
    },
    {
      label: `Add Styled Components`,
      value: `styled-components.mdx`,
    },
    {
      label: `Add Tailwind`,
      value: `tailwindcss.mdx`,
    },
    {
      label: `Add Sass`,
      value: `sass.mdx`,
    },
    {
      label: `Add Typescript`,
      value: `typescript.mdx`,
    },
    {
      label: `Add Cypress testing`,
      value: `cypress.mdx`,
    },
    {
      label: `Add animated page transition support`,
      value: `animated-page-transitions.mdx`,
    },
    {
      label: `Add plugins to make site a PWA`,
      value: `pwa.mdx`,
    },
    {
      label: `Add React Helmet`,
      value: `gatsby-plugin-react-helmet.mdx`,
    },
    {
      label: `Add Headless WordPress integration`,
      value: `wordpress.mdx`,
    },
    {
      label: `Add Storybook - JavaScript`,
      value: `storybook-js.mdx`,
    },
    {
      label: `Add Storybook - TypeScript`,
      value: `storybook-ts.mdx`,
    },
    {
      label: `Add Ava`,
      value: `ava.mdx`,
    },
    {
      label: `Add Preact`,
      value: `preact.mdx`,
    },
  ]

  return (
    <SelectInput
      items={items}
      onSelect={setRecipe}
      indicatorComponent={item => (
        <Color magentaBright>
          {item.isSelected ? `>>` : `  `}
          {item.label}
        </Color>
      )}
      itemComponent={props => (
        <Color magentaBright={props.isSelected}>{props.label}</Color>
      )}
    />
  )
}

let renderCount = 1

const Div = props => {
  const width = Math.min(process.stdout.columns, MAX_UI_WIDTH)
  return (
    <Box
      width={width}
      textWrap="wrap"
      flexShrink={0}
      flexDirection="column"
      {...props}
    />
  )
}

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

const components = {
  inlineCode: props => <Text {...props} />,
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
    <Div marginBottom={1}>
      <Text bold underline {...props} />
    </Div>
  ),
  h2: props => (
    <Div>
      <Text bold {...props} />
    </Div>
  ),
  h3: props => (
    <Div>
      <Text bold italic {...props} />
    </Div>
  ),
  h4: props => (
    <Div>
      <Text bold {...props} />
    </Div>
  ),
  h5: props => (
    <Div>
      <Text bold {...props} />
    </Div>
  ),
  h6: props => (
    <Div>
      <Text bold {...props} />
    </Div>
  ),
  a: ({ href, children }) => <Link url={href}>{children}</Link>,
  strong: props => <Text bold {...props} />,
  em: props => <Text italic {...props} />,
  p: props => {
    const children = eliminateNewLines(props.children)
    return (
      <Div marginBottom={1}>
        <Text>{children}</Text>
      </Div>
    )
  },
  ul: props => <Div marginBottom={1}>{props.children}</Div>,
  li: props => <Text>* {props.children}</Text>,
  Config: () => null,
  GatsbyPlugin: () => null,
  NPMPackageJson: () => null,
  NPMPackage: () => null,
  File: () => null,
  Directory: () => null,
  GatsbyShadowFile: () => null,
  NPMScript: () => null,
}

let logStream
const log = (label, textOrObj) => {
  if (process.env.DEBUG) {
    logStream =
      logStream ?? fs.createWriteStream(`recipe-client.log`, { flags: `a` })
    logStream.write(`[${label}]:\n`)
    logStream.write(require(`util`).inspect(textOrObj))
    logStream.write(`\n`)
  }
}

log(
  `started client`,
  `======================================= ${new Date().toJSON()}`
)

module.exports = async ({ recipe, graphqlPort, projectRoot }) => {
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
        mutation ($recipePath: String!, $projectRoot: String!) {
          createOperation(recipePath: $recipePath, projectRoot: $projectRoot)
        }
      `)
      // eslint-disable-next-line
      const [__, sendEvent] = useMutation(`
        mutation($event: String!) {
          sendEvent(event: $event)
        }
      `)

      subscriptionClient.connectionCallback = async () => {
        if (!showRecipesList) {
          log(`createOperation`)
          try {
            await createOperation({ recipePath: localRecipe, projectRoot })
          } catch (e) {
            log(`error creating operation`, e)
          }
        }
      }

      log(`subscriptionResponse`, subscriptionResponse)
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

      log(`subscriptionResponse.data`, subscriptionResponse.data)

      if (showRecipesList) {
        return (
          <>
            <WelcomeMessage />
            <Text bold underline>
              Select a recipe to run
            </Text>
            <RecipesList
              setRecipe={async recipeItem => {
                trackCli(`RECIPE_RUN`, { name: recipeItem.value })
                showRecipesList = false
                try {
                  await createOperation({
                    recipePath: recipeItem.value,
                    projectRoot,
                  })
                } catch (e) {
                  log(`error creating operation`, e)
                }
              }}
            />
          </>
        )
      }

      if (!state) {
        return (
          <Text>
            <Spinner /> Loading recipe
          </Text>
        )
      }
      /*
       * TODOs
       * Listen to "y" to continue (in addition to enter)
       */

      log(`render`, `${renderCount} ${new Date().toJSON()}`)
      renderCount += 1

      const isDone = state.value === `done`

      // If we're done with an error, render out error (happens below)
      // then exit.
      if (state.value === `doneError`) {
        process.nextTick(() => process.exit())
      }

      if (process.env.DEBUG) {
        log(`state`, state)
        log(`plan`, state.context.plan)
        log(`stepResources`, state.context.stepResources)
      }

      const PresentStep = ({ state }) => {
        const isPlan = state.context.plan && state.context.plan.length > 0
        const isPresetPlanState = state.value === `presentPlan`
        const isRunningStep = state.value === `applyingPlan`

        if (isRunningStep) {
          return null
        }

        if (!isPlan || !isPresetPlanState) {
          return (
            <Div marginTop={1}>
              <Color magentaBright>>> Press enter to continue</Color>
            </Div>
          )
        }

        return (
          <Div>
            <Div>
              <Text bold italic marginBottom={2}>
                Proposed changes
              </Text>
            </Div>
            {state.context.plan.map((p, i) => (
              <Div marginTop={1} key={`${p.resourceName} plan ${i}`}>
                <Text italic>{p.resourceName}:</Text>
                <Text> * {p.describe}</Text>
                {p.diff && p.diff !== `` && (
                  <>
                    <Text>---</Text>
                    <Text>{p.diff}</Text>
                    <Text>---</Text>
                  </>
                )}
              </Div>
            ))}
            <Div marginTop={1}>
              <Color magentaBright>>> Press enter to run this step</Color>
            </Div>
          </Div>
        )
      }

      const RunningStep = ({ state }) => {
        const isPlan = state.context.plan && state.context.plan.length > 0
        const isRunningStep = state.value === `applyingPlan`

        if (!isPlan || !isRunningStep) {
          return null
        }

        return (
          <Div>
            {state.context.plan.map((p, i) => (
              <Div key={`${p.resourceName}-${i}`}>
                <Text italic>{p.resourceName}:</Text>
                <Text>
                  {` `}
                  <Spinner /> {p.describe}
                  {` `}
                  {state.context.elapsed > 0 && (
                    <Text>({state.context.elapsed / 1000}s elapsed)</Text>
                  )}
                </Text>
              </Div>
            ))}
          </Div>
        )
      }

      const Error = ({ state }) => {
        log(`errors`, state)
        if (state && state.context && state.context.error) {
          return (
            <Color red>{JSON.stringify(state.context.error, null, 2)}</Color>
          )
        }

        return null
      }

      if (state.value === `doneError`) {
        return <Error width="100%" state={state} />
      }

      const staticMessages = {}
      for (let step = 0; step < state.context.currentStep; step++) {
        staticMessages[step] = [
          {
            type: `mdx`,
            key: `mdx-${step}`,
            value: state.context.steps[step],
          },
        ]
      }
      lodash.flattenDeep(state.context.stepResources).forEach((res, i) => {
        staticMessages[res._currentStep].push({
          type: `resource`,
          key: `finished-stuff-${i}`,
          value: res._message,
        })
      })

      log(`staticMessages`, staticMessages)

      if (isDone) {
        process.nextTick(() => {
          subscriptionClient.close()
          exit()
          process.stdout.write(
            `\n\n---\n\n\nThe recipe finished successfully!\n\n`
          )
          lodash.flattenDeep(state.context.stepResources).forEach((res, i) => {
            process.stdout.write(`✅ ${res._message}\n`)
          })
          process.exit()
        })
        // return null
      }

      return (
        <>
          <Div>
            <Static>
              {Object.keys(staticMessages).map((key, iStep) =>
                staticMessages[key].map((r, i) => {
                  if (r.type && r.type === `mdx`) {
                    return (
                      <Div key={r.key}>
                        {iStep === 0 && <Text underline>Completed Steps</Text>}
                        <Div marginTop={iStep === 0 ? 0 : 1} marginBottom={1}>
                          {iStep !== 0 && `---`}
                        </Div>
                        {iStep !== 0 && <Text>Step {iStep}</Text>}
                        <MDX components={components}>{r.value}</MDX>
                      </Div>
                    )
                  }
                  return <Text key={r.key}>✅ {r.value}</Text>
                })
              )}
            </Static>
          </Div>
          {state.context.currentStep === 0 && <WelcomeMessage />}
          {state.context.currentStep > 0 && !isDone && (
            <Div marginTop={7}>
              <Text underline bold>
                Step {state.context.currentStep} /{` `}
                {state.context.steps.length - 1}
              </Text>
            </Div>
          )}
          <MDX components={components}>
            {state.context.steps[state.context.currentStep]}
          </MDX>
          {!isDone && <PresentStep state={state} />}
          {!isDone && <RunningStep state={state} />}
        </>
      )
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
    log(e)
  }
}
