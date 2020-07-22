const fs = require(`fs`)
const lodash = require(`lodash`)
const Boxen = require(`ink-box`)
const React = require(`react`)
const { useState, useEffect } = require(`react`)
const { render, Box, Text, useInput, useApp, Static } = require(`ink`)
const Spinner = require(`ink-spinner`).default
const Link = require(`ink-link`)
const MDX = require(`./components/mdx`).default
const hicat = require(`hicat`)
import { trackCli } from "gatsby-telemetry"
import {
  useResourceByUUID,
  ResourceProvider,
} from "./renderer/resource-provider"
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
const remove = require(`unist-util-remove`)

const removeJsx = () => tree => {
  remove(tree, `export`, () => true)
  return tree
}

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
      label: `Add GitHub Pages deployment with Travis CI`,
      value: `travis-deploy-github-pages.mdx`,
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
      label: `Add AVA`,
      value: `ava.mdx`,
    },
    {
      label: `Add Preact`,
      value: `preact.mdx`,
    },
    {
      label: `Add GitLab CI/CD`,
      value: `gitlab-ci-cd.mdx`,
    },
  ]

  return (
    <SelectInput
      items={items}
      onSelect={setRecipe}
      indicatorComponent={item => (
        <Text color="magentaBright">
          {item.isSelected ? `>>` : `  `}
          {item.label}
        </Text>
      )}
      itemComponent={props => (
        <Text color="magentaBright">
          {props.isSelected}>{props.label}
        </Text>
      )}
    />
  )
}

let renderCount = 1

const Div = props => {
  const width = Math.max(process.stdout.columns, MAX_UI_WIDTH)
  return <Box textWrap="wrap" flexDirection="column" {...props} />
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

const ResourceComponent = props => {
  const resource = useResourceByUUID(props._uuid)
  return (
    <Div marginBottom={1}>
      <Text>~~~</Text>
      <Text color="yellow" backgroundColor="black" bold underline>
        {props._type}:
      </Text>
      <Text color="green">{resource?.describe}</Text>
      {resource?.diff ? <Text>{resource?.diff}"</Text> : null}
      <Text>~~~</Text>
    </Div>
  )
}

const components = {
  inlineCode: props => <Text {...props} />,
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
      <Div marginBottom={1}>
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
  RecipeStep: props => (
    <Div>
      <Box
        borderStyle="single"
        padding={1}
        flexDirection="column"
        borderColor="gray"
      >
        {props.children}
      </Box>
    </Div>
  ),
  div: props => <Div {...props} />,
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
    const Plan = ({ state }) => {
      // console.log(state)
      const { exit } = useApp()
      // Exit the app after we render
      useEffect(() => {
        exit()
      }, [])

      return (
        <>
          <ResourceProvider
            value={
              state.context.plan?.filter(p => p.resourceName !== `Input`) || []
            }
          >
            <MDX key="DOC" components={components} remarkPlugins={[removeJsx]}>
              {state.context.steps.join(`\n`)}
            </MDX>
            <Text>{`\n------\n`}</Text>
            <Text color="yellow">To install this recipe, run:</Text>
            <Text>{` `}</Text>
            <Text>{`  `}gatsby recipes ./test.mdx --install</Text>
            <Text>{` `}</Text>
          </ResourceProvider>
        </>
      )
    }

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
      const [__, _sendEvent] = useMutation(`
        mutation($event: String!, $input: String) {
          sendEvent(event: $event, input: $input)
        }
      `)

      const sendEvent = ({ event, input }) => {
        log(`sending event`, { event, input })
        if (input) {
          log(`sending event`, input)
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

      const isReady = state?.value === `presentPlan`
      if (!isReady) {
        return (
          <Text>
            <Spinner /> Loading recipe
          </Text>
        )
      }

      // if (state.value === `waitingForInput`) {
      // return <Text>Input some stuff!</Text>
      // }

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
              <Text color="magentaBright">>> Press enter to continue</Text>
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
              <Text color="magentaBright">>> Press enter to run this step</Text>
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
          return <Text red>{JSON.stringify(state.context.error, null, 2)}</Text>
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
      log(`steps joined`, state.context.steps.join(`\n`))

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

      // <Div>
      // <static>
      // {object.keys(staticmessages).map((key, istep) =>
      // staticmessages[key].map((r, i) => {
      // if (r.type && r.type === `mdx`) {
      // return (
      // <div key={r.key}>
      // {istep === 0 && <text underline>completed steps</text>}
      // <div margintop={istep === 0 ? 0 : 1} marginbottom={1}>
      // {istep !== 0 && `---`}
      // </div>
      // {istep !== 0 && <text>step {istep}</text>}
      // <mdx components={components}>{r.value}</mdx>
      // </div>
      // )
      // }
      // return <Text key={r.key}>✅ {r.value}</Text>
      // })
      // )}
      // </Static>
      // </Div>
      //
      // <PresentStep state={state} />

      // <MDX
      // components={components}
      // >{`<RecipeIntroduction># hi</RecipeIntroduction>` [> state.context.steps.join(`\n`) <]}</MDX>
      // console.log(
      // React.createElement(
      // MDX,
      // { key: "DOC", components, remarkPlugins: [removeJsx] },
      // `# hi`
      // )
      // )
      // console.log({
      // state: JSON.stringify(state, null, 4),
      // plans: state.context.plan[0],
      // resources:
      // state.context.plan?.filter(p => p.resourceName !== `Input`) || [],
      // })
      return <Plan state={state} />
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
