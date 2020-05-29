/** @jsx jsx */
import { jsx, ThemeProvider as ThemeUIProvider } from "theme-ui"
const lodash = require(`lodash`)
const React = require(`react`)
const { useState } = require(`react`)
const MDX = require(`@mdx-js/runtime`).default
const ansi2HTML = require(`ansi-html`)
const {
  Button,
  ThemeProvider,
  getTheme,
  BaseAnchor,
  Text,
  Heading,
} = require(`gatsby-interface`)
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
const slugify = require(`slugify`)

console.log(Heading)

const SelectInput = `select`

const makeResourceId = res => {
  const id = encodeURIComponent(`${res.resourceName}-${slugify(res.describe)}`)
  return id
}

const PROJECT_ROOT = `/Users/kylemathews/projects/gatsby/starters/blog`

const Boxen = `div`
const Static = `div`
const Color = `span`
const Spinner = () => <span>Loading...</span>

const theme = getTheme()
console.log({ theme })

const WelcomeMessage = () => (
  <>
    <Text>
      Thank you for trying the experimental version of Gatsby Recipes!
    </Text>
    <Text>
      Please ask questions, share your recipes, report bugs, and subscribe for
      updates in our umbrella issue at
      https://github.com/gatsbyjs/gatsby/issues/22991
    </Text>
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
  RecipeIntroduction: props => <div {...props} />,
  RecipeStep: props => <div {...props} />,
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

      const ResourcePlan = ({ resourcePlan }) => (
        <div
          id={makeResourceId(resourcePlan)}
          sx={{
            margin: 2,
            padding: 2,
          }}
        >
          <div>
            <Text>
              {resourcePlan.resourceName} — {resourcePlan.describe}
            </Text>
          </div>
          {resourcePlan.diff && (
            <pre
              sx={{
                background: theme => theme.tones.BRAND.lighter,
                padding: 3,
              }}
              dangerouslySetInnerHTML={{
                __html: ansi2HTML(resourcePlan.diff),
              }}
            />
          )}
        </div>
      )

      const Step = ({ state, step, i }) => {
        const [output, setOutput] = useState({
          title: ``,
          body: ``,
          date: new Date(),
        })

        const stepResources = state.context?.plan?.filter(
          p => p._stepMetadata.step === i + 1
        )
        console.log({ stepResources })

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
              border: theme => `1px solid ${theme.tones.BRAND.medium}`,
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
                background: theme => theme.tones.BRAND.light,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 3,
              }}
            >
              <div
                sx={{
                  // marginTop: 2,
                  "& > p": {
                    margin: 0,
                  },
                }}
              >
                <MDX components={components}>{step}</MDX>
              </div>
            </div>
            <div sx={{ padding: 3 }}>
              <Heading as={`h5`}>Proposed changes</Heading>
              {stepResources?.map((res, i) => (
                <ResourcePlan key={`res-plan-${i}`} resourcePlan={res} />
              ))}
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

      const groupedPlans = lodash.groupBy(
        state.context.plan,
        p => p.resourceName
      )
      console.log({ groupedPlans })

      return (
        <Wrapper>
          {state.context.currentStep === 0 && <WelcomeMessage />}
          <br />
          <div>
            <MDX components={components}>{state.context.steps[0]}</MDX>
          </div>
          <Button sx={{ marginBottom: 4 }}>Install Recipe</Button>
          <div sx={{ marginBottom: 7 }}>
            <Heading sx={{ marginBottom: 3 }}>Proposed changes</Heading>
            {Object.entries(groupedPlans).map(([resourceName, plans]) => (
              <div>
                <Heading as="h4" sx={{ margin: 0 }}>
                  {resourceName}
                </Heading>
                <ul sx={{ marginBottom: 3, marginTop: 0 }}>
                  {plans.map((p, i) => (
                    <li key={`${resourceName}-plan-${i}`}>
                      <BaseAnchor
                        href={`#${makeResourceId(p)}`}
                        onClick={e => {
                          const target = document.getElementById(
                            e.target.hash.slice(1)
                          )
                          console.log(target)
                          e.preventDefault()
                          target.scrollIntoView({
                            behavior: `smooth`, // smooth scroll
                            block: `start`, // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
                          })
                        }}
                      >
                        <Text>{p.describe}</Text>
                      </BaseAnchor>
                    </li>
                  ))}
                </ul>
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

const WithProviders = ({ children }) => {
  const baseTheme = getTheme()

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: `white`,
    },
    fontWeights: {
      ...baseTheme.fontWeights,
    },
    styles: {
      h1: {
        fontSize: 6,
        fontFamily: `heading`,
        fontWeight: `heading`,
        mt: 0,
        mb: 4,
      },
      p: {
        fontSize: 1,
        fontFamily: `body`,
        fontWeight: `body`,
        mt: 0,
        mb: 4,
      },
    },
  }
  return (
    <ThemeUIProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeUIProvider>
  )
}

export default () => (
  <WithProviders>
    <RecipeGui />
  </WithProviders>
)
