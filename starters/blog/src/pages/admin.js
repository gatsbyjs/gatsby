const lodash = require(`lodash`)
const React = require(`react`)
const { useState } = require(`react`)
const MDX = require(`@mdx-js/runtime`).default
const {
  createClient,
  useMutation,
  useSubscription,
  Provider,
  defaultExchanges,
  subscriptionExchange,
} = require(`urql`)
const { SubscriptionClient } = require(`subscriptions-transport-ws`)
const semver = require(`semver`)

const SelectInput = 'select'

// Check for what version of React is loaded & warn if it's too low.
if (semver.lt(React.version, `16.8.0`)) {
  console.log(
    `Recipes works best with newer versions of React. Please file a bug report if you see this warning.`
  )
}

const PROJECT_ROOT = '/Users/johno-mini/c/gatsby/starters/blog'

const Boxen = 'div'
const Text = 'p'
const Static = 'div'
const Color = 'span'
const Spinner = () => <div>Loading...</div>

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
    {
      label: `Add Gatsby Theme Blog`,
      value: `gatsby-theme-blog`,
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
      label: `Add Storybook - JavaScript`,
      value: `storybook-js.mdx`,
    },
    {
      label: `Add Storybook - TypeScript`,
      value: `storybook-ts.mdx`,
    },
    // TODO remaining recipes
  ]

  return (
    <SelectInput
      onChange={e => setRecipe(e.target.value)}
    >
      {items.map(item => (
        <option key={item.value} value={item.value}>{item.label}</option>
      ))}
    </SelectInput>
  )
}

const Div = props => <div {...props} />

const components = {
  inlineCode: props => <code {...props} />,
  Config: () => null,
  GatsbyPlugin: () => null,
  NPMPackageJson: () => null,
  NPMPackage: () => null,
  File: () => null,
  GatsbyShadowFile: () => null,
  NPMScript: () => null,
}

const log = (label, textOrObj) => {
  console.log(label, textOrObj)
}

log(
  `started client`,
  `======================================= ${new Date().toJSON()}`
)

const RecipeGui = ({ recipe, graphqlPort = 4000, projectRoot = PROJECT_ROOT }) => {
  try {
    const GRAPHQL_ENDPOINT = `http://localhost:${graphqlPort}/graphql`

    const subscriptionClient = new SubscriptionClient(
      `ws://localhost:${graphqlPort}/graphql`,
      {
        reconnect: true,
      }
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
                console.log(recipeItem)
                showRecipesList = false
                try {
                  await createOperation({
                    recipePath: recipeItem,
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
        console.log('Loading recipe!')
        return (
          <Text>
            <Spinner /> Loading recipe
          </Text>
        )
      }

      console.log(state)
      console.log('!!!!!!')

      const isDone = state.value === `done`

      if (state.value === `doneError`) {
        console.error(state)
      }

      if (true) {
        log(`state`, state)
        log(`plan`, state.context.plan)
        log(`stepResources`, state.context.stepResources)
      }

      const PresentStep = ({ state }) => {
        const isPlan = state.context.plan && state.context.plan.length > 0
        const isPresetPlanState = state.value === `presentPlan`
        const isRunningStep = state.value === `applyingPlan`

        if (isRunningStep) {
          console.log('running step')
          return null
        }

        if (!isPlan || !isPresetPlanState) {
          return (
            <Div marginTop={1}>
              <button onClick={() => sendEvent({ event: `CONTINUE` })}>Go!</button>
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
              <button onClick={() => sendEvent({ event: 'CONTINUE'})}>
                Go!
              </button>
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
          log('The recipe finished successfully')
          lodash.flattenDeep(state.context.stepResources).forEach((res, i) => {
            log(`✅ ${res._message}\n`)
          })
        })
      }

      return (
        <>
          <Div>
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

    return <Recipe />
  } catch (e) {
    log(e)
  }
}

export default () => <RecipeGui />
