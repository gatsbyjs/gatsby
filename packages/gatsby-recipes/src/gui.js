/** @jsx jsx */
import { jsx, ThemeProvider as ThemeUIProvider, Styled } from "theme-ui"
const lodash = require(`lodash`)
const React = require(`react`)
const { useState } = require(`react`)
const ansi2HTML = require(`ansi-html`)
const remove = require(`unist-util-remove`)
const { Global } = require('@emotion/core')
import { MdRefresh, MdBrightness1 } from "react-icons/md"
import { keyframes } from "@emotion/core"
import MDX from "./components/mdx"

const {
  Button,
  ThemeProvider,
  getTheme,
  BaseAnchor,
  Heading,
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
const UrqlProvider = Provider
const { SubscriptionClient } = require(`subscriptions-transport-ws`)
const slugify = require(`slugify`)
require(`normalize.css`)

import { useInputByKey, InputProvider } from "./renderer/input-provider"
import { useResource, ResourceProvider } from "./renderer/resource-provider"

const theme = getTheme()

ansi2HTML.setColors({
  red: theme.tones.DANGER.medium.slice(1),
  green: theme.tones.SUCCESS.medium.slice(1),
  yellow: theme.tones.WARNING.medium.slice(1),
})

const makeResourceId = res => {
  if (!res.describe) {
    res.describe = ``
  }
  const id = encodeURIComponent(`${res.resourceName}-${slugify(res.describe)}`)
  return id
}

let sendEvent

const PROJECT_ROOT = `/Users/kylemathews/programs/gatsby-contentful-blog` &&
  `/Users/johno-mini/c/gatsby/starters/blog`

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
  Input: () => null,
  Directory: () => null,
  GatsbyShadowFile: () => null,
  NPMScript: () => null,
  RecipeIntroduction: props => <div>{props.children}</div>,
  RecipeStep: props => <div>{props.children}</div>,
  ContentfulSpace: () => null,
  ContentfulEnvironment: () => null,
  ContentfulType: () => null,
}

const log = (label, textOrObj) => {
  console.log(label, textOrObj)
}

log(
  `started client`,
  `======================================= ${new Date().toJSON()}`
)

const removeJsx = () => tree => {
  remove(tree, `mdxBlockElement`, node => node.name === `File`)

  remove(tree, `export`, node => true)
  return tree
}

const recipe = `./test.mdx`
// recipe = `jest.mdx`,
// recipe,
const graphqlPort = 4000
const projectRoot = PROJECT_ROOT

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
          borderRadius: 2,
          border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
          padding: 4,
          mb: isLastPlan ? 0 : 6,
        }}
        dangerouslySetInnerHTML={{
          __html: ansi2HTML(resourcePlan.diff),
        }}
      />
    )}
    {resourcePlan.resourceChildren
      ? resourcePlan.resourceChildren.map(resource => (
          <ResourcePlan key={resource._uuid} resourcePlan={resource} />
        ))
      : null}
  </div>
)

const Step = ({ state, step, i }) => {
  const [output, setOutput] = useState({
    title: ``,
    body: ``,
    date: new Date(),
  })

  const stepResources = state.context?.plan?.filter(
    p => parseInt(p._stepMetadata.step, 10) === i + 1
  )

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
        position: 'relative',
        borderRadius: 2,
        border: theme => `1px solid ${theme.tones.BRAND.light}`,
        marginBottom: 7,
      }}
    >
      <div
        sx={{
          position: 'absolute',
          backgroundColor: 'white',
          color: theme => theme.tones.BRAND.dark,
          right: '8px',
          top: '8px',
          border: theme => `1px solid ${theme.tones.BRAND.light}`,
          borderRadius: 9999,
          height: 40,
          width: 40,
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          lineHeight: '34px'
        }}
      >
        {i + 1}
      </div>
      <div
        sx={{
          display: `flex`,
          // justifyContent: `space-between`,
          "& > *": {
            marginY: 0,
          },
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottom: theme => `1px solid ${theme.tones.BRAND.light}`,
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
          <MDX
            key="DOC"
            components={{
              ...components,
            }}
            scope={{ sendEvent }}
            remarkPlugins={[removeJsx]}
          >
            {state.context.exports.join(`\n`) + `\n\n` + step}
          </MDX>
        </div>
      </div>
      {stepResources?.length > 0 && (
        <div>
          <div sx={{ padding: 6 }}>
            {stepResources?.map((res, i) => {
              if (res.resourceName === `Input`) {
                if (res.type === `textarea`) {
                  return (
                    <div>
                      <div>
                        <label>{res.label}</label>
                      </div>
                      <textarea
                        sx={{ border: `1px solid` }}
                        onInput={e => {
                          sendInputEvent({
                            uuid: res._uuid,
                            key: res._key,
                            value: e.target.value,
                          })
                        }}
                      />
                    </div>
                  )
                }
                return (
                  <div>
                    <div>
                      <label>{res.label}</label>
                    </div>
                    <input
                      sx={{ border: `1px solid` }}
                      type={res.type}
                      onInput={e => {
                        sendInputEvent({
                          uuid: res._uuid,
                          key: res._key,
                          value: e.target.value,
                        })
                      }}
                    />
                  </div>
                )
              }
            })}
          </div>
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
            {stepResources?.map((res, i) => {
              if (res.resourceName !== `Input`) {
                return (
                  <ResourcePlan
                    key={`res-plan-${i}`}
                    resourcePlan={res}
                    isLastPlan={i === stepResources.length - 1}
                  />
                )
              }
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const sendInputEvent = event => {
  sendEvent({
    event: `INPUT_ADDED`,
    input: event,
  })
}

const ResourceMessage = ({ state, resource }) => {
  let icon = (
    <MdBrightness1
      sx={{ height: `10px`, width: `15px`, display: `inline-block` }}
    />
  )
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
          display: `inline-block`,
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
    <>
      {icon}
      {` `}
      <BaseAnchor
        href={`#${makeResourceId(resource)}`}
        onClick={e => {
          e.preventDefault()
          const target = document.getElementById(e.currentTarget.hash.slice(1))
          target.scrollIntoView({
            behavior: `smooth`, // smooth scroll
            block: `start`, // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
          })
        }}
      >
        {message}
      </BaseAnchor>
    </>
  )
}

const ButtonText = state => {
  if (state.value === `done`) {
    return `Refresh State`
  }

  return `Install Recipe`
}

const ResourceChildren = ({ resourceChildren, state }) => {
  if (!resourceChildren || !resourceChildren.length) {
    return null
  }

  return (
    <Styled.ul sx={{ pl: 3, marginTop: 0, mb: 5 }}>
      {resourceChildren.map(resource => (
        <Styled.li
          sx={{
            listStyleType: `none`,
          }}
          key={resource._uuid}
        >
          <ResourceMessage state={state} resource={resource} />
          <ResourceChildren
            state={state}
            resourceChildren={resource.resourceChildren}
          />
        </Styled.li>
      ))}
    </Styled.ul>
  )
}

function Wrapper({ children }) {
  return <div sx={{ maxWidth: 1000, margin: `0 auto` }}>{children}</div>
}

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
  const [__, _sendEvent] = useMutation(`
        mutation($event: String!, $input: String) {
          sendEvent(event: $event, input: $input)
        }
      `)

  sendEvent = ({ event, input }) => {
    if (input) {
      _sendEvent({ event, input: JSON.stringify(input) })
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

  const state =
    subscriptionResponse.data &&
    JSON.parse(subscriptionResponse.data.operation.state)

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

  const isDone = state.value === `done`

  if (state.value === `doneError`) {
    console.log(`doneError state`, state)
  }

  log(`state`, state)
  log(`plan`, state.context.plan)
  log(`stepResources`, state.context.stepResources)

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
  log(`renderTime`, new Date())

  if (isDone) {
    process.nextTick(() => {
      subscriptionClient.close()
      log(`The recipe finished successfully`)
      lodash.flattenDeep(state.context.stepResources).forEach((res, i) => {
        log(`✅ ${res._message}\n`)
      })
    })
  }

  const plansWithoutInputs = state.context.plan?.filter(
    p => p.resourceName !== `Input`
  )

  const groupedPlans = lodash.groupBy(plansWithoutInputs, p => p.resourceName)

  return (
    <>
      <Styled.p>{` `}</Styled.p>
      <ResourceProvider
        value={
          state.context.plan?.filter(
            p => p.resourceName !== `Input` && p.resourceDefinitions?._key
          ) || []
        }
      >
        <InputProvider value={state.context.inputs || {}}>
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
                <MDX
                  components={components}
                  scope={{ sendEvent }}
                  remarkPlugins={[removeJsx]}
                >
                  {state.context.exports.join(`\n`) +
                    `\n\n` +
                    state.context.steps[0]}
                </MDX>
              </div>
              <Button
                onClick={() => sendEvent({ event: `CONTINUE` })}
                loading={state.value === `applyingPlan` ? true : false}
                loadingLabel={`Installing`}
                sx={{ width: `140px`, ml: 6 }}
              >
                <ButtonText state={state} />
              </Button>
            </div>
            <div sx={{ marginBottom: 8 }}>
              <Heading sx={{ marginBottom: 6 }}>
                {plansWithoutInputs?.length}
                {` `}
                Changes
              </Heading>
              {Object.entries(groupedPlans).map(([resourceName, plans]) => (
                <div key={`key-${resourceName}`}>
                  <Heading
                    as="h3"
                    sx={{ mb: 3, fontWeight: 400, fontStyle: `italic` }}
                  >
                    {resourceName}
                  </Heading>
                  <Styled.ul sx={{ pl: 3, marginTop: 0, mb: 5 }}>
                    {plans
                      .filter(p => p.resourceName !== `Input`)
                      .map((p, i) => (
                        <Styled.li
                          sx={{
                            listStyleType: `none`,
                          }}
                          key={`${resourceName}-plan-${i}`}
                        >
                          <ResourceMessage state={state} resource={p} />
                          <ResourceChildren
                            state={state}
                            resourceChildren={p.resourceChildren}
                          />
                        </Styled.li>
                      ))}
                  </Styled.ul>
                </div>
              ))}
            </div>

            <Heading sx={{ mb: 6 }}>
              {state.context.steps.length - 1} Steps
            </Heading>
            {state.context.steps.slice(1).map((step, i) => (
              <Step state={state} step={step} key={`step-${i}`} i={i} />
            ))}
          </Wrapper>
        </InputProvider>
      </ResourceProvider>
    </>
  )
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
        fontSize: 0,
        lineHeight: 1.45,
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
    <UrqlProvider value={client}>
      <ThemeUIProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <main>{children}</main>
        </ThemeProvider>
      </ThemeUIProvider>
    </UrqlProvider>
  )
}

const GlobalStyles = () => {
  return (
  <Global
    styles={{
      body: {
        fontFamily: '-apple-system, system-ui, sans-serif'
      },
      h1: {
        fontWeight: 700,
        fontFamily: 'Futura PT,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif!'
      }
    }}
  />)
}

export default () => (
  <WithProviders>
    <GlobalStyles />
    <RecipeInterpreter />
  </WithProviders>
)
