const fs = require(`fs`)
const path = require(`path`)
const { inspect } = require(`util`)

const React = require(`react`)
const { useState, useContext, useEffect } = require(`react`)
const { render, Box, Text, useInput, useApp, Static } = require(`ink`)
const Spinner = require(`ink-spinner`).default
const Link = require(`ink-link`)
const MDX = require(`@mdx-js/runtime`)
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

const parser = require(`./parser`)

const PlanDescribe = ({ resourceName }) => {
  const { planForNextStep = [] } = usePlan()
  const plans = planForNextStep.filter(p => p.resourceName === resourceName)

  return null
  return (
    <Box>
      {plans.map((stepPlan, i) => (
        <Text key={i}>{stepPlan.describe || `* ${resourceName}`}</Text>
      ))}
    </Box>
  )
}

const Div = props => (
  <Box width={80} textWrap="wrap" flexDirection="column" {...props} />
)

const components = {
  inlineCode: props => <Text {...props} />,
  h1: props => (
    <Div marginBottom={1}>
      <Text bold underline {...props} />
    </Div>
  ),
  h2: props => <Text bold {...props} />,
  h3: props => <Text bold italic {...props} />,
  h4: props => <Text bold {...props} />,
  h5: props => <Text bold {...props} />,
  h6: props => <Text bold {...props} />,
  a: ({ href, children }) => <Link url={href}>{children}</Link>,
  strong: props => <Text bold {...props} />,
  em: props => <Text italic {...props} />,
  p: props => (
    <Box
      width="100%"
      marginBottom={1}
      flexDirection="row"
      textWrap="wrap"
      {...props}
    />
  ),
  ul: props => <Div marginBottom={1}>{props.children}</Div>,
  li: props => <Text>* {props.children}</Text>,
  Config: () => null,
  GatsbyPlugin: () => <PlanDescribe resourceName="GatsbyPlugin" />,
  NPMPackageJson: () => <PlanDescribe resourceName="NPMPackageJson" />,
  NPMPackage: () => null,
  File: () => <PlanDescribe resourceName="File" />,
  ShadowFile: () => <PlanDescribe resourceName="ShadowFile" />,
  NPMScript: () => null,
}

const isRelative = path => {
  if (path.slice(0, 1) == `.`) {
    return true
  }

  return false
}

const log = (label, textOrObj) => {
  const text =
    typeof textOrObj === `string` ? textOrObj : inspect(textOrObj, null, 2)

  let contents = ``
  try {
    contents = fs.readFileSync(`recipe-client.log`, `utf8`)
  } catch (e) {
    // File doesn't exist yet
  }

  contents += label + `: ` + text + `\n`
  fs.writeFileSync(`recipe-client.log`, contents)
}

log(
  `started client`,
  `======================================= ${new Date().toJSON()}`
)

const PlanContext = React.createContext({})
const usePlan = () => useContext(PlanContext)

module.exports = ({ recipe, projectRoot }) => {
  let recipePath
  if (isRelative(recipe)) {
    recipePath = path.join(projectRoot, recipe)
  } else {
    recipePath = path.join(__dirname, recipe)
  }
  if (recipePath.slice(-4) !== `.mdx`) {
    recipePath += `.mdx`
  }

  const recipeSrc = fs.readFileSync(recipePath, `utf8`)
  const GRAPHQL_ENDPOINT = `http://localhost:4000/graphql`

  const subscriptionClient = new SubscriptionClient(
    `ws://localhost:4000/graphql`,
    {
      reconnect: true,
    },
    ws
  )

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

  let parsed = {}
  try {
    parsed = parser(recipeSrc)
  } catch (e) {
    if (process.env.DEBUG) {
      console.log(e)
    }
    console.log(`Unable to parse `, recipe)
    process.exit()
  }

  const { commands: allCommands, stepsAsMdx: stepsAsMDX } = parsed

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      log(`error`, { error, errorInfo })
    }

    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>Something went wrong.</h1>
      }

      return this.props.children
    }
  }

  let renderCount = 1
  const RecipeInterpreter = ({ commands }) => {
    const [lastKeyPress, setLastKeyPress] = useState(``)
    const { exit } = useApp()
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
    const [_, createOperation] = useMutation(`
      mutation ($commands: String!) {
        createOperation(commands: $commands)
      }
    `)
    const [__, sendEvent] = useMutation(`
      mutation($event: String!) {
        sendEvent(event: $event)
      }
    `)

    subscriptionClient.connectionCallback = async () => {
      await createOperation({ commands: JSON.stringify(commands) })
    }

    const state = (subscriptionResponse.data &&
      JSON.parse(subscriptionResponse.data.operation.state)) || {
      state: `waitingForData`,
    }

    useInput((_, key) => {
      setLastKeyPress(key)
      if (key.return && state.value === `SUCCESS`) {
        subscriptionClient.close()
        exit()
        // TODO figure out why exiting ink isn't enough.
        process.exit()
      } else if (key.return) {
        sendEvent({ event: `CONTINUE` })
      }
    })

    /*
     * TODOs
     * on last step w/ no plan just exit
     * show what's happened in Static — probably the state machine should put these in new context key.
     */

    log(`render`, `${renderCount} ${new Date().toJSON()}`)
    renderCount += 1

    if (!subscriptionResponse.data) {
      return null
    }

    // If we're done, exit.
    if (state.value === `done`) {
      process.exit()
    }

    if (process.env.DEBUG) {
      log(`state`, state)
      log(`plan`, state.context.plan)
    }

    const PresentStep = ({ state }) => {
      const isPlan = state.context.plan && state.context.plan.length > 0
      const isPresetPlanState = state.value === `present plan`
      const isRunningStep = state.value === `applyingPlan`

      if (isRunningStep) {
        return null
      }

      if (!isPlan || !isPresetPlanState) {
        return (
          <Div>
            <Text>Press enter to continue</Text>
          </Div>
        )
      }

      return (
        <Div>
          {state.context.plan.map(p => {
            return (
              <Div key={p.resourceName}>
                <Text italic>{p.resourceName}:</Text>
                <Text> * {p.describe}</Text>
              </Div>
            )
          })}
          <Div marginTop={1}>
            <Text>Do you want to run this step? Y/n</Text>
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
          {state.context.plan.map(p => {
            return (
              <Div key={p.resourceName}>
                <Text italic>{p.resourceName}:</Text>
                <Text>
                  {` `}
                  <Spinner /> {p.describe}
                </Text>
              </Div>
            )
          })}
        </Div>
      )
    }

    // <Static>
    // <Text bold>Finished</Text>
    // <Text italic>Step 1</Text>
    // <Text>✅ Wrote out file to src/pages/what-about-bob.js</Text>
    // <Text italic>Step 2</Text>
    // <Text>
    // ✅ Shadowed file src/gatsby-theme-blog/foo.js from gatsby-theme-blog
    // </Text>
    // </Static>
    return (
      <ErrorBoundary>
        {state.context.currentStep > 0 && (
          <Div>
            <Text>
              Step {state.context.currentStep} /{` `}
              {state.context.steps.length - 1}
            </Text>
          </Div>
        )}
        <PlanContext.Provider value={{ planForNextStep: state.plan }}>
          <MDX components={components}>
            {stepsAsMDX[state.context.currentStep]}
          </MDX>
          <PresentStep state={state} />
          <RunningStep state={state} />
        </PlanContext.Provider>
      </ErrorBoundary>
    )
  }

  // {operation.map((command, i) => (
  // <Div key={i}>
  // <Div />
  // </Div>
  // ))}
  // {state === `SUCCESS` ? (
  // <Div>
  // <Text> </Text>
  // <Text>Your recipe is served! Press enter to exit.</Text>
  // </Div>
  // ) : null}
  const StateIndicator = ({ state }) => {
    if (state === `complete`) {
      return <Text> ✅ </Text>
    } else if (state === `error`) {
      return <Text> ❌ </Text>
    } else {
      return <Spinner />
    }
  }

  const Wrapper = () => (
    <Provider value={client}>
      <Text>{` `}</Text>
      <RecipeInterpreter commands={allCommands} />
    </Provider>
  )

  const Recipe = () => <Wrapper steps={stepsAsMDX} />

  // Enable experimental mode for more efficient reconciler and renderer
  render(<Recipe />, { experimental: true })
}
