/** @jsx jsx */
import { jsx } from "theme-ui"
const lodash = require(`lodash`)
const React = require(`react`)
const { useState } = require(`react`)
const MDX = require(`@mdx-js/runtime`).default
const ansi2HTML = require(`ansi-html`)
const {
  CircularProgressbarWithChildren,
} = require(`react-circular-progressbar`)
require(`react-circular-progressbar/dist/styles.css`)
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

const SelectInput = `select`

// Check for what version of React is loaded & warn if it's too low.
if (semver.lt(React.version, `16.8.0`)) {
  console.log(
    `Recipes works best with newer versions of React. Please file a bug report if you see this warning.`
  )
}

const PROJECT_ROOT = `/Users/kylemathews/projects/gatsby/starters/blog`

const Boxen = `div`
const Text = `p`
const Static = `div`
const Color = `span`
const Spinner = () => <span>Loading...</span>

const WelcomeMessage = () => (
  <>
    <Boxen float="left" padding={1} margin={{ bottom: 1, left: 2 }}>
      Thank you for trying the experimental version of Gatsby Recipes!
    </Boxen>
    <Div margin-bottom={2}>
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
    <SelectInput onChange={e => setRecipe(e.target.value)}>
      {items.map(item => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
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

const RecipeGui = ({
  recipe = `jest.mdx`,
  graphqlPort = 4000,
  projectRoot = PROJECT_ROOT,
}) => {
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

      function Wrapper({ children }) {
        return <div sx={{ maxWidth: 1000, margin: `0 auto` }}>{children}</div>
      }

      if (showRecipesList) {
        return (
          <Wrapper>
            <WelcomeMessage />
            <Text>Select a recipe to run</Text>
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
          </Wrapper>
        )
      }

      if (!state) {
        console.log(`Loading recipe!`)
        return (
          <Wrapper>
            <Spinner /> Loading recipe
          </Wrapper>
        )
      }

      console.log(state)
      console.log(`!!!!!!`)

      const isDone = state.value === `done`

      if (state.value === `doneError`) {
        console.error(state)
      }

      if (true) {
        log(`state`, state)
        log(`plan`, state.context.plan)
        log(`stepResources`, state.context.stepResources)
      }

      const Step = ({ state, step, i }) => {
        const [output, setOutput] = useState({
          title: ``,
          body: ``,
          date: new Date(),
        })

        const [complete, setComplete] = useState(false)
        if (output.title !== `` && output.body !== ``) {
          setTimeout(() => {
            setComplete(true)
          }, 0)
        } else {
          setTimeout(() => {
            setComplete(false)
          }, 0)
        }

        return (
          <div
            key={`step-${i}`}
            sx={{
              border: `1px solid tomato`,
              marginBottom: 4,
              borderRadius: 20,
            }}
          >
            <div
              sx={{
                display: `flex`,
                // justifyContent: `space-between`,
                "& > *": {
                  marginY: 0,
                },
                background: `PaleGoldenRod`,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 2,
              }}
            >
              <div
                sx={{
                  "& > *": {
                    marginY: 0,
                  },
                  display: `flex`,
                  alignItems: `flex-start`,
                }}
              >
                <div>
                  <CircularProgressbarWithChildren
                    value={66}
                    sx={{ height: `34px`, width: `34px` }}
                  >
                    {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}

                    <div style={{ fontSize: `18px` }}>
                      <strong>5/7</strong>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
              </div>
              <div
                sx={{
                  // marginTop: 2,
                  "& > *": {
                    marginTop: 0,
                  },
                }}
              >
                <MDX components={components}>{step}</MDX>
              </div>
            </div>
            <div sx={{ padding: 3 }}>
              <Div>
                <div>
                  <label>title</label>
                </div>
                <div>
                  <input
                    type="text"
                    onChange={e => {
                      const newOutput = { ...output, title: e.target.value }
                      setOutput(newOutput)
                    }}
                  />
                </div>
                <div>
                  <label>body</label>
                </div>
                <div>
                  <textarea
                    onChange={e => {
                      const newOutput = { ...output, body: e.target.value }
                      setOutput(newOutput)
                    }}
                  />
                </div>
                <h4>Proposed changes</h4>
                <pre>{JSON.stringify(output, null, 2)}</pre>
              </Div>
            </div>
          </div>
        )
      }

      const PresentStep = ({ step }) => {
        // const isPlan = state.context.plan && state.context.plan.length > 0
        // const isPresetPlanState = state.value === `presentPlan`
        // const isRunningStep = state.value === `applyingPlan`
        // console.log(`PresentStep`, { isRunningStep, isPlan, isPresetPlanState })
        // if (isRunningStep) {
        // console.log("running step")
        // return null
        // }
        // if (!isPlan || !isPresetPlanState) {
        // return (
        // <Div margin-top={1}>
        // <button onClick={() => sendEvent({ event: `CONTINUE` })}>
        // Go!
        // </button>
        // </Div>
        // )
        // }
        //
        // {plan.map((p, i) => (
        // <Div margin-top={1} key={`${p.resourceName} plan ${i}`}>
        // <Text>{p.resourceName}:</Text>
        // <Text> * {p.describe}</Text>
        // {p.diff && p.diff !== `` && (
        // <>
        // <Text>---</Text>
        // <pre
        // sx={{
        // lineHeight: 0.7,
        // background: `#f5f3f2`,
        // padding: [3],
        // "& > span": {
        // display: `block`,
        // },
        // }}
        // dangerouslySetInnerHTML={{ __html: ansi2HTML(p.diff) }}
        // />
        // <Text>---</Text>
        // </>
        // )}
        // </Div>
        // ))}
        // <Div margin-top={1}>
        // <button onClick={() => sendEvent({ event: "CONTINUE" })}>
        // Go!
        // </button>
        // </Div>
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
                <Text>{p.resourceName}:</Text>
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
          log(`The recipe finished successfully`)
          lodash.flattenDeep(state.context.stepResources).forEach((res, i) => {
            log(`✅ ${res._message}\n`)
          })
        })
      }

      return (
        <Wrapper>
          {state.context.currentStep === 0 && <WelcomeMessage />}
          <br />
          <div sx={{ width: `100%`, padding: 3, background: `PaleGoldenRod` }}>
            recipe status
          </div>
          <div>
            <MDX components={components}>{state.context.steps[0]}</MDX>
          </div>
          <h2>Proposed changes</h2>
          <button>Apply changes</button>
          <div>count {state.context.plan?.length}</div>
          <div sx={{ marginBottom: 4 }}>
            {state.context.plan?.map(p => (
              <div>
                {p.resourceName} — {p.describe}
              </div>
            ))}
          </div>

          {state.context.steps.slice(1).map((step, i) => (
            <Step state={state} step={step} i={i} />
          ))}
        </Wrapper>
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
