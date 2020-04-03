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
        <Text key={i}>{stepPlan.describe}</Text>
      ))}
    </Box>
  )
}

const components = {
  inlineCode: props => (
    // log(`inlineCode`, { props })
    <Text {...props} />
  ),
  h1: props => <Text bold underline {...props} />,
  h2: props => <Text bold underline {...props} />,
  h3: props => <Text bold underline {...props} />,
  h4: props => <Text bold underline {...props} />,
  h5: props => <Text bold underline {...props} />,
  h6: props => <Text bold underline {...props} />,
  a: ({ href, children }) => {
    log(`Link`, { href, children })
    return <Link url={href}>{children}</Link>
  },
  p: props => {
    log(`paragraph`, { props })
    return <Box width="100%" flexDirection="row" textWrap="wrap" {...props} />
  },
  li: props => {
    log(`li`, { props })
    return <Text>* {props.children}</Text>
  },
  Config: () => null,
  GatsbyPlugin: () => <PlanDescribe resourceName="GatsbyPlugin" />,
  NPMPackage: () => <PlanDescribe resourceName="NPMPackage" />,
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

  const {
    commands: allCommands,
    stepsAsMdx: stepsAsMDX,
    stepsAsMdxWithoutJsx: stepsAsMDXNoJSX,
  } = parser(recipeSrc)

  const Div = props => (
    <Box width={80} textWrap="wrap" flexDirection="column" {...props} />
  )

  const RecipeInterpreter = ({ commands }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [lastKeyPress, setLastKeyPress] = useState(``)
    const { exit } = useApp()
    const [subscriptionResponse] = useSubscription(
      {
        query: `
        subscription {
          operation {
            state
            data
            planForNextStep
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
    const [__, applyOperationStep] = useMutation(`
      mutation {
        applyOperationStep
      }
    `)

    subscriptionClient.connectionCallback = async () => {
      await createOperation({ commands: JSON.stringify(commands) })
    }

    const { data } = subscriptionResponse
    const operation =
      (data &&
        data.operation &&
        data.operation.data &&
        JSON.parse(data.operation.data)) ||
      commands

    const planForNextStep =
      (data &&
        data.operation &&
        data.operation.planForNextStep &&
        JSON.parse(data.operation.planForNextStep)) ||
      []

    const state = data && data.operation && data.operation.state

    useInput((_, key) => {
      setLastKeyPress(key)
      if (key.return && state === `SUCCESS`) {
        subscriptionClient.close()
        exit()
        // TODO figure out why exiting ink isn't enough.
        process.exit()
      } else if (key.return) {
        setCurrentStep(currentStep + 1)
        applyOperationStep()
      }
    })

    if (process.env.DEBUG) {
      // log(`subscriptionResponse`, subscriptionResponse)
      // log(`state`, state)
    }

    return (
      <PlanContext.Provider value={{ planForNextStep }}>
        <MDX components={components}>{stepsAsMDX[currentStep]}</MDX>
        <Div />
        <Text>Press enter to apply!</Text>
        {operation.map((command, i) => (
          <Div key={i}>
            <Div />
          </Div>
        ))}
        {state === `SUCCESS` ? (
          <Div>
            <Text> </Text>
            <Text>Your recipe is served! Press enter to exit.</Text>
          </Div>
        ) : null}
      </PlanContext.Provider>
    )
  }

  const StateIndicator = ({ state }) => {
    if (state === `complete`) {
      return <Text> ✅ </Text>
    } else if (state === `error`) {
      return <Text> ❌ </Text>
    } else {
      return <Spinner />
    }
  }

  const Config = ({ commands }) => {
    const cmd = commands[0] // Config should only be called once.

    const verb = cmd.state !== `complete` ? `Setting` : `Set`
    return (
      <Div>
        <Box>
          <StateIndicator state={cmd.state} />
          <Text> </Text>
          <Text>
            {verb} up plan for {cmd.name}
          </Text>
        </Box>
      </Div>
    )
  }

  const NPMPackage = ({ commands }) => {
    const incomplete = commands.some(c => c.state !== `complete`)
    const names = commands.map(c => c.name)

    if (incomplete) {
      return (
        <Div>
          <Text>Installing packages</Text>
          {commands.map(cmd => (
            <Div key={cmd.name}>
              <Box>
                <Text> </Text>
                <StateIndicator state={cmd.state} />
                <Text> </Text>
                <Text>{cmd.name}</Text>
              </Box>
            </Div>
          ))}
        </Div>
      )
    }

    return (
      <Div>
        <Box>
          <StateIndicator state="complete" />
          <Text> </Text>
          <Text>Installed {humanizeList(names)}</Text>
        </Box>
      </Div>
    )
  }

  const NPMScript = ({ commands }) => {
    const incomplete = commands.some(c => c.state !== `complete`)
    const names = commands.map(c => c.name)

    if (incomplete) {
      return (
        <Div>
          <Text>Adding scripts</Text>
          {commands.map(cmd => (
            <Div key={cmd.name}>
              <Box>
                <Text> </Text>
                <StateIndicator state={cmd.state} />
                <Text> </Text>
                <Text>{cmd.name}</Text>
              </Box>
            </Div>
          ))}
        </Div>
      )
    }

    return (
      <Div>
        <Box>
          <StateIndicator state="complete" />
          <Text> </Text>
          <Text>Added scripts for {humanizeList(names)}</Text>
        </Box>
      </Div>
    )
  }

  const GatsbyPlugin = ({ commands }) => {
    const incomplete = commands.some(c => c.state !== `complete`)
    const names = commands.map(c => c.name)

    if (incomplete) {
      return (
        <Div>
          <Text>Configuring plugins</Text>
          {commands.map(cmd => (
            <Div key={cmd.name}>
              <Box>
                <Text> </Text>
                <StateIndicator state={cmd.state} />
                <Text> </Text>
                <Text>{cmd.name}</Text>
              </Box>
            </Div>
          ))}
        </Div>
      )
    }

    return (
      <Div>
        <Box>
          <StateIndicator state="complete" />
          <Text> </Text>
          <Text>Configured {humanizeList(names)}</Text>
        </Box>
      </Div>
    )
  }

  const ShadowFile = ({ commands }) => {
    const incomplete = commands.some(c => c.state !== `complete`)
    const paths = commands.map(c => c.path)

    if (incomplete) {
      return (
        <Div>
          <Text>Shadowing files</Text>
          {commands.map(cmd => (
            <Div key={cmd.path}>
              <Box>
                <Text> </Text>
                <StateIndicator state={cmd.state} />
                <Text> </Text>
                <Text>{cmd.path}</Text>
              </Box>
            </Div>
          ))}
        </Div>
      )
    }

    return (
      <Div>
        <Box>
          <StateIndicator state="complete" />
          <Text> </Text>
          <Text>Shadowed {humanizeList(paths)}</Text>
        </Box>
      </Div>
    )
  }

  const File = ({ commands }) => {
    const incomplete = commands.some(c => c.state !== `complete`)
    const paths = commands.map(c => c.path)

    if (incomplete) {
      return (
        <Div>
          <Text>Writing files</Text>
          {commands.map(cmd => (
            <Div key={cmd.path}>
              <Box>
                <Text> </Text>
                <StateIndicator state={cmd.state} />
                <Text> </Text>
                <Text>{cmd.path}</Text>
              </Box>
            </Div>
          ))}
        </Div>
      )
    }

    return (
      <Div>
        <Box>
          <StateIndicator state="complete" />
          <Text> </Text>
          <Text>Created file {humanizeList(paths)}</Text>
        </Box>
      </Div>
    )
  }

  const Step = ({ command }) =>
    Object.entries(command).map(([cmdName, cmds], i) => {
      if (cmdName === `Config`) {
        return <Config key={i} commands={cmds} />
      } else if (cmdName === `NPMPackage`) {
        return <NPMPackage key={i} commands={cmds} />
      } else if (cmdName === `NPMScript`) {
        return <NPMScript key={i} commands={cmds} />
      } else if (cmdName === `GatsbyPlugin`) {
        return <GatsbyPlugin key={i} commands={cmds} />
      } else if (cmdName === `ShadowFile`) {
        return <ShadowFile key={i} commands={cmds} />
      } else if (cmdName === `File`) {
        return <File key={i} commands={cmds} />
      } else {
        return <Text key={i}>{cmdName}</Text>
      }
    })

  const Wrapper = () => (
    <Provider value={client}>
      <RecipeInterpreter commands={allCommands} />
    </Provider>
  )

  const Recipe = () => <Wrapper steps={stepsAsMDX} />

  // Enable experimental mode for more efficient reconciler and renderer
  render(<Recipe />, { experimental: true })
}
