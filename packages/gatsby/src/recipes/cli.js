const fs = require(`fs`)
const path = require(`path`)
const { inspect } = require(`util`)

const React = require(`react`)
const { useState, useContext } = require(`react`)
const { render, Box, Text, useInput, useApp } = require(`ink`)
const Spinner = require(`ink-spinner`).default
const Link = require(`ink-link`)
const MDX = require(`@mdx-js/runtime`)
const humanizeList = require(`humanize-list`)
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

  return (
    <Box>
      {plans.map((stepPlan, i) => (
        <Text key={i}>{stepPlan.describe || `* ${resourceName}`}</Text>
      ))}
    </Box>
  )
}

const components = {
  inlineCode: props => <Text {...props} />,
  h1: props => <Text bold underline {...props} />,
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
  li: props => <Text>* {props.children}</Text>,
  Config: () => null,
  GatsbyPlugin: () => <PlanDescribe resourceName="GatsbyPlugin" />,
  NPMPackageJson: () => <PlanDescribe resourceName="NPMPackageJson" />,
  NPMPackage: ({ name }) => (
    // const { planForNextStep = [] } = usePlan()

    <Box>
      <Text>* {name}</Text>
    </Box>
  ),
  File: () => <PlanDescribe resourceName="File" />,
  ShadowFile: () => <PlanDescribe resourceName="ShadowFile" />,
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
    console.log('Unable to parse ', recipe)
    process.exit()
  }

  const { commands: allCommands, stepsAsMdx: stepsAsMDX } = parsed

  const Div = props => (
    <Box width={80} textWrap="wrap" flexDirection="column" {...props} />
  )

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
        // setCurrentStep(currentStep + 1)
        sendEvent({ event: `CONTINUE` })
      }
    })

    log(`render`, new Date().toJSON())

    if (!subscriptionResponse.data) {
      return null
    }

    if (state.value === `done`) {
      process.exit()
    }

    if (process.env.DEBUG) {
      log(`state`, state)
    }

    return (
      <PlanContext.Provider value={{ planForNextStep: state.plan }}>
        <MDX components={components}>
          {stepsAsMDX[state.context.currentStep]}
        </MDX>
        <Text>{` `}</Text>
        <Text>Press enter to apply!</Text>
      </PlanContext.Provider>
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
