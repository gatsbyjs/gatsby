/** @jsx jsx */
import * as GatsbyComponents from "gatsby-interface"
import { jsx, ThemeProvider as ThemeUIProvider, Styled } from "theme-ui"
const lodash = require(`lodash`)
const React = require(`react`)
const { useState } = require(`react`)
const MDX = require(`@mdx-js/runtime`).default
const ansi2HTML = require(`ansi-html`)
import { MdRefresh, MdBrightness1 } from "react-icons/md"
import { keyframes } from "@emotion/core"
const {
  Button,
  ThemeProvider,
  getTheme,
  BaseAnchor,
  Heading,
  InProgressIcon,
  SuccessIcon,
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
const slugify = require(`slugify`)
require(`normalize.css`)

console.log({ GatsbyComponents })

const theme = getTheme()

ansi2HTML.setColors({
  red: theme.tones.DANGER.medium.slice(1),
  green: theme.tones.SUCCESS.medium.slice(1),
})

const makeResourceId = res => {
  const id = encodeURIComponent(`${res.resourceName}-${slugify(res.describe)}`)
  return id
}

const PROJECT_ROOT = `/Users/kylemathews/programs/recipes-test`

const Color = `span`
const Spinner = () => <span>Loading...</span>

const WelcomeMessage = () => (
  <div
    sx={{
      marginTop: 8,
      marginBottom: 8,
      background: theme => theme.tones.BRAND.superLight,
      border: theme => `1px solid ${theme.tones.BRAND.light}`,
      padding: 4,
    }}
  >
    <Styled.p>
      Thank you for trying the experimental version of Gatsby Recipes! 🤗
    </Styled.p>
    <Styled.p sx={{ margin: 0 }}>
      Please ask questions, share your recipes, report bugs, and subscribe for
      updates in our umbrella issue at{` `}
      <BaseAnchor href="https://github.com/gatsbyjs/gatsby/issues/22991">
        https://github.com/gatsbyjs/gatsby/issues/22991
      </BaseAnchor>
    </Styled.p>
  </div>
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
    <select onChange={e => setRecipe(e.target.value)}>
      {items.map(item => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )
}

const components = {
  inlineCode: props => <code {...props} />,
  Config: () => null,
  GatsbyPlugin: () => null,
  NPMPackageJson: () => null,
  NPMPackage: () => null,
  File: () => null,
  Directory: () => null,
  GatsbyShadowFile: () => null,
  NPMScript: () => null,
  RecipeIntroduction: props => <div>{props.children}</div>,
  RecipeStep: props => <div>{props.children}</div>,
  h2: props => <Styled.h2 {...props} />,
}

const log = (label, textOrObj) => {
  console.log(label, textOrObj)
}

log(
  `started client`,
  `======================================= ${new Date().toJSON()}`
)

const RecipeGui = ({
  recipe = `./test.mdx`,
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
            <Styled.p>Select a recipe to run</Styled.p>
            <RecipesList
              setRecipe={async recipeItem => {
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
        return (
          <Wrapper>
            <Spinner /> Loading recipe
          </Wrapper>
        )
      }

      console.log(state)

      const isDone = state.value === `done`

      if (state.value === `doneError`) {
        console.error(state)
      }

      log(`state`, state)
      log(`plan`, state.context.plan)
      log(`stepResources`, state.context.stepResources)

      const ResourcePlan = ({ resourcePlan, isLastPlan }) => (
        <div id={makeResourceId(resourcePlan)} sx={{}}>
          <div>
            <Styled.p sx={{ mb: resourcePlan.diff ? 6 : 0 }}>
              <Styled.em>{resourcePlan.resourceName}</Styled.em>
              {` `}—{` `}
              {resourcePlan.describe}
            </Styled.p>
          </div>
          {resourcePlan.diff && (
            <Styled.pre
              sx={{
                background: theme => theme.tones.BRAND.superLight,
                border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
                padding: 4,
                mb: isLastPlan ? 0 : 6,
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

        console.log(state.context.plan, i)
        const stepResources = state.context?.plan?.filter(p => {
          return parseInt(p._stepMetadata.step, 10) === i + 1
        })

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
              border: theme => `1px solid ${theme.tones.BRAND.light}`,
              marginBottom: 7,
            }}
          >
            <div
              sx={{
                display: `flex`,
                // justifyContent: `space-between`,
                "& > *": {
                  marginY: 0,
                },
                background: theme => theme.tones.BRAND.lighter,
                padding: 4,
              }}
            >
              <div
                sx={{
                  // marginTop: 2,
                  "p:last-child": {
                    margin: 0,
                  },
                }}
              >
                <MDX components={components}>{step}</MDX>
              </div>
            </div>
            {stepResources?.length > 0 && (
              <div sx={{ padding: 6 }}>
                <Heading
                  sx={{
                    marginBottom: 4,
                    color: theme => theme.tones.NEUTRAL.darker,
                    fontWeight: 500,
                  }}
                  as={`h3`}
                >
                  Proposed changes
                </Heading>
                {stepResources?.map((res, i) => (
                  <ResourcePlan
                    key={`res-plan-${i}`}
                    resourcePlan={res}
                    isLastPlan={i === stepResources.length - 1}
                  />
                ))}
              </div>
            )}
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
        // <div margin-top={1}>
        // <button onClick={() => sendEvent({ event: `CONTINUE` })}>
        // Go!
        // </button>
        // </div>
        // )
        // }
        //
        // {plan.map((p, i) => (
        // <div margin-top={1} key={`${p.resourceName} plan ${i}`}>
        // <Styled.p>{p.resourceName}:</Styled.p>
        // <Styled.p> * {p.describe}</Styled.p>
        // {p.diff && p.diff !== `` && (
        // <>
        // <Styled.p>---</Styled.p>
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
        // <Styled.p>---</Styled.p>
        // </>
        // )}
        // </div>
        // ))}
        // <div margin-top={1}>
        // <button onClick={() => sendEvent({ event: "CONTINUE" })}>
        // Go!
        // </button>
        // </div>
      }

      const RunningStep = ({ state }) => {
        const isPlan = state.context.plan && state.context.plan.length > 0
        const isRunningStep = state.value === `applyingPlan`

        if (!isPlan || !isRunningStep) {
          return null
        }

        return (
          <div>
            {state.context.plan.map((p, i) => (
              <div key={`${p.resourceName}-${i}`}>
                <Styled.p>{p.resourceName}:</Styled.p>
                <Styled.p>
                  {` `}
                  <Spinner /> {p.describe}
                  {` `}
                  {state.context.elapsed > 0 && (
                    <Styled.p>
                      ({state.context.elapsed / 1000}s elapsed)
                    </Styled.p>
                  )}
                </Styled.p>
              </div>
            ))}
          </div>
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

      const ResourceMessage = ({ resource }) => {
        let icon = <MdBrightness1 sx={{ height: `10px`, width: `15px` }} />
        let message = resource.describe

        if (state.value === `applyingPlan` && resource.isDone) {
          icon = <SuccessIcon />
        } else if (state.value === `applyingPlan`) {
          const keyframe = keyframes`
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
`
          icon = (
            <MdRefresh
              sx={{
                animation: `${keyframe} 1s linear infinite`,
                height: `15px`,
                width: `15px`,
                top: `3px`,
                position: `relative`,
              }}
            />
          )
          message = resource.describe
        } else if (state.value === `done`) {
          icon = <SuccessIcon height="15px" width="15px" />
          message = resource._message
        }

        return (
          <div>
            {icon} {` `}
            <BaseAnchor
              href={`#${makeResourceId(resource)}`}
              onClick={e => {
                e.preventDefault()
                const target = document.getElementById(
                  e.currentTarget.hash.slice(1)
                )
                target.scrollIntoView({
                  behavior: `smooth`, // smooth scroll
                  block: `start`, // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
                })
              }}
            >
              {message}
            </BaseAnchor>
          </div>
        )
      }

      const ButtonText = () => {
        if (state.value === `done`) {
          return `Refresh State`
        }

        return `Install Recipe`
      }

      return (
        <Wrapper>
          <WelcomeMessage />
          <div
            sx={{
              mb: 8,
              display: `flex`,
              alignItems: `flex-start`,
              justifyContent: `space-between`,
            }}
          >
            <div sx={{ "*:last-child": { mb: 0 } }}>
              <MDX components={components}>{state.context.steps[0]}</MDX>
            </div>
            <Button
              onClick={() => sendEvent({ event: `CONTINUE` })}
              loading={state.value === `applyingPlan` ? true : false}
              loadingLabel={`Installing`}
              sx={{ width: `140px`, ml: 6 }}
            >
              <ButtonText />
            </Button>
          </div>
          <div sx={{ marginBottom: 8 }}>
            <Heading sx={{ marginBottom: 6 }}>
              Changes
              {` `}
              {state.context.plan &&
                `(${state.context.plan.filter(p => p.isDone).length}/${
                  state.context.plan?.length
                })`}
            </Heading>
            {Object.entries(groupedPlans).map(([resourceName, plans]) => (
              <div key={`key-${resourceName}`}>
                <Heading
                  as="h4"
                  sx={{ mb: 3, fontWeight: 400, fontStyle: `italic` }}
                >
                  {resourceName}
                </Heading>
                <Styled.ul sx={{ pl: 3, marginTop: 0, mb: 5 }}>
                  {plans.map((p, i) => (
                    <Styled.li
                      sx={{
                        listStyleType: `none`,
                      }}
                      key={`${resourceName}-plan-${i}`}
                    >
                      <ResourceMessage resource={p} />
                    </Styled.li>
                  ))}
                </Styled.ul>
              </div>
            ))}
          </div>

          <Heading sx={{ mb: 6 }}>
            Steps ({state.context.steps.length - 1})
          </Heading>
          {state.context.steps.slice(1).map((step, i) => (
            <Step state={state} step={step} key={`step-${i}`} i={i} />
          ))}
        </Wrapper>
      )
    }

    const Wrapper = () => (
      <>
        <Provider value={client}>
          <Styled.p>{` `}</Styled.p>
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
      h2: {
        fontSize: 5,
        fontFamily: `heading`,
        fontWeight: `heading`,
        mt: 0,
        mb: 4,
      },
      p: {
        color: baseTheme.tones.NEUTRAL.dark,
        fontSize: 2,
        fontFamily: `body`,
        fontWeight: `body`,
        mt: 0,
        mb: 4,
        lineHeight: 1.45,
      },
      pre: {
        mt: 0,
        mb: 6,
        whiteSpace: `pre-wrap`,
      },
      ol: {
        color: baseTheme.tones.NEUTRAL.dark,
        paddingLeft: 8,
        mt: 0,
        mb: 6,
        fontFamily: `body`,
        fontWeight: `body`,
      },
      ul: {
        color: baseTheme.tones.NEUTRAL.dark,
        paddingLeft: 8,
        mt: 0,
        mb: 6,
        fontFamily: `body`,
        fontWeight: `body`,
      },
      li: {
        color: baseTheme.tones.NEUTRAL.dark,
        mb: 2,
        fontFamily: `body`,
        fontWeight: `body`,
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
