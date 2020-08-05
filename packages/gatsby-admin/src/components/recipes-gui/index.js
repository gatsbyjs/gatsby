/** @jsx jsx */
import { jsx, ThemeProvider as ThemeUIProvider, Styled } from "theme-ui"
import { MdRefresh, MdBrightness1 } from "react-icons/md"
import { keyframes } from "@emotion/core"
import MDX from "gatsby-recipes/src/components/mdx"
import { InputProvider } from "gatsby-recipes/src/renderer/input-provider"
import { ResourceProvider } from "gatsby-recipes/src/renderer/resource-provider"
import { createUrqlClient } from "../../urql-client"
import lodash from "lodash"
import React from "react"
import { useState } from "react"
import ansi2HTML from "ansi-html"
import remove from "unist-util-remove"
import { Global } from "@emotion/core"

import fetch from "isomorphic-fetch"

import WelcomeMessage from "./welcome-message"
import {
  Button,
  ThemeProvider,
  TextAreaField,
  TextAreaFieldControl,
  getTheme,
  BaseAnchor,
  Heading,
  SuccessIcon,
  InputField,
  InputFieldLabel,
  InputFieldControl,
} from "gatsby-interface"
import { useMutation, useSubscription } from "urql"
import slugify from "slugify"
import "normalize.css"

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

//TODO: We need to be able to grab this dynamically
const PROJECT_ROOT = `/Users/laurie/Documents/Gatsby/gatsby/starters/blog`

const Spinner = () => <span>Loading...</span>

const escapeTags = str => str.replace(/</g, `&lt;`)

const DiffPre = ({ resourcePlan, ...props }) => (
  <Styled.pre
    {...props}
    sx={{
      background: theme => theme.tones.BRAND.superLight,
      borderRadius: 2,
      padding: 4,
    }}
    dangerouslySetInnerHTML={{
      __html: ansi2HTML(escapeTags(resourcePlan.diff)),
    }}
  />
)

const Diff = ({ resourcePlan, ...props }) => {
  if (!resourcePlan.diff) {
    return null
  }

  if (resourcePlan.resourceName === `File`) {
    return (
      <div
        sx={{
          background: theme => theme.tones.BRAND.superLight,
          border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
          borderRadius: 2,
        }}
      >
        <Heading
          as="h6"
          sx={{
            px: 4,
            py: 3,
            fontWeight: `normal`,
            borderBottom: theme => `1px solid ${theme.tones.BRAND.lighter}`,
          }}
        >
          {resourcePlan.resourceDefinitions.path}
        </Heading>
        <DiffPre
          resourcePlan={resourcePlan}
          sx={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        />
      </div>
    )
  }

  return (
    <DiffPre
      {...props}
      resourcePlan={resourcePlan}
      sx={{
        border: theme => `1px solid ${theme.tones.BRAND.lighter}`,
      }}
    />
  )
}



const components = {
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

const removeJsx = () => tree => {
  remove(tree, `export`, () => true)
  return tree
}

const graphqlPort = 50400
const projectRoot = PROJECT_ROOT

const API_ENDPOINT = `http://localhost:${graphqlPort}`

let isSubscriptionConnected = false
let isRecipeStarted = false
let sessionId

const checkServerSession = async () => {
  const response = await fetch(`${API_ENDPOINT}/session`)
  const newSessionId = await response.text()
  if (!sessionId) {
    sessionId = newSessionId
  } else if (newSessionId !== sessionId) {
    window.location.reload()
  }
}

const ResourcePlan = ({ resourcePlan, isLastPlan }) => (
  <div id={makeResourceId(resourcePlan)} sx={{}}>
    <div>
      <Styled.p sx={{ mb: resourcePlan.diff ? 6 : 0 }}>
        <Styled.em>{resourcePlan.resourceName}</Styled.em>
        {` `}—{` `}
        {resourcePlan.describe}
      </Styled.p>
    </div>
    <Diff resourcePlan={resourcePlan} />
    {resourcePlan.resourceChildren
      ? resourcePlan.resourceChildren.map(resource => (
          <ResourcePlan key={resource._uuid} resourcePlan={resource} />
        ))
      : null}
  </div>
)

const Step = ({ state, step, i }) => {
  const stepResources = state.context?.plan?.filter(
    p => parseInt(p._stepMetadata.step, 10) === i + 1
  )

  return (
    <div
      key={`step-${i}`}
      sx={{
        position: `relative`,
        borderRadius: 2,
        border: theme => `1px solid ${theme.tones.BRAND.light}`,
        marginBottom: 7,
      }}
    >
      <div
        sx={{
          position: `absolute`,
          backgroundColor: `white`,
          color: theme => theme.tones.BRAND.dark,
          right: `6px`,
          top: `6px`,
          border: theme => `1px solid ${theme.tones.BRAND.light}`,
          borderRadius: 9999,
          height: 30,
          width: 30,
          display: `flex`,
          alignContent: `center`,
          justifyContent: `center`,
          lineHeight: `28px`,
        }}
      >
        {i + 1}
      </div>
      <div
        sx={{
          display: `flex`,
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
            components={components}
            scope={{ sendEvent }}
            remarkPlugins={[removeJsx]}
          >
            {state.context.exports?.join(`\n`) + `\n\n` + step}
          </MDX>
        </div>
      </div>
      {stepResources?.length > 0 && (
        <div>
          <div sx={{ px: 6, pt: 3 }}>
            {stepResources?.map((res, i) => {
              if (res.resourceName === `Input`) {
                if (res.type === `textarea`) {
                  return (
                    <div sx={{ pt: 3, width: `30%`, maxWidth: `100%` }}>
                      <TextAreaField>
                        <div>
                          <InputFieldLabel>{res.label}</InputFieldLabel>
                        </div>
                        <TextAreaFieldControl
                          onInput={e => {
                            sendInputEvent({
                              uuid: res._uuid,
                              key: res._key,
                              value: e.target.value,
                            })
                          }}
                        />
                      </TextAreaField>
                    </div>
                  )
                }
                return (
                  <div sx={{ pt: 3, width: `30%`, maxWidth: `100%` }}>
                    <InputField sx={{ pt: 3 }}>
                      <div>
                        <InputFieldLabel>{res.label}</InputFieldLabel>
                      </div>
                      <InputFieldControl
                        type={res.type}
                        onInput={e => {
                          sendInputEvent({
                            uuid: res._uuid,
                            key: res._key,
                            value: e.target.value,
                          })
                        }}
                      />
                    </InputField>
                  </div>
                )
              }

              return null
            })}
          </div>
          <div sx={{ padding: 6 }}>
            <Heading
              sx={{
                mb: 4,
                mt: 0,
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

              return null
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
    <Styled.ul sx={{ ml: 0, mt: 0, pl: 0 }}>
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

const RecipeInterpreter = ({ recipe }) => {
  const [client, setClient] = useState(null)

  React.useEffect(() => {
    fetch(`/___services`)
      .then(res => res.json())
      .then(json => {
        if (json.recipesgraphqlserver) {
          const newClient = createUrqlClient({
            port: json.recipesgraphqlserver.port,
            connectionCallback: async () => {
              checkServerSession()
              startRecipe(recipe)
            },
          })
          setClient(newClient)
        }
      })
  }, [])
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

  const startRecipe = async recipe => {
    log(`createOperation`)
    if (!isRecipeStarted) {
      isRecipeStarted = true
      try {
        await createOperation({ recipePath: recipe, projectRoot })
      } catch (e) {
        log(`error creating operation`, e)
        isRecipeStarted = false
      }
    }

    checkServerSession()
  }

  if (isSubscriptionConnected) {
    startRecipe()
  }

  const state =
    subscriptionResponse.data &&
    JSON.parse(subscriptionResponse.data.operation.state)

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
      client.close()
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
                  {state.context.exports?.join(`\n`) +
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
            <div sx={{ marginBottom: 14 }}>
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
        fontFamily: baseTheme.fonts.monospace,
        fontSize: 0,
        lineHeight: 1.45,
        mt: 0,
        mb: 6,
        whiteSpace: `pre-wrap`,
      },
      inlineCode: {
        backgroundColor: `hsla(0,0%,0%,0.06)`,
        color: baseTheme.tones.NEUTRAL.darker,
        borderRadius: `3px`,
        py: `0.2em`,
        px: `0.2em`,
        fontSize: `90%`,
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
        lineHeight: 1.6,
      },
    },
  }

  return (
    <ThemeUIProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <main>{children}</main>
      </ThemeProvider>
    </ThemeUIProvider>
  )
}

const GlobalStyles = () => (
  <Global
    styles={{
      body: {
        fontFamily: `-apple-system, system-ui, sans-serif`,
      },
      h1: {
        fontWeight: 700,
        fontFamily: `Futura PT,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif!`,
      },
    }}
  />
)

export default ({ recipe }) => (
  <WithProviders>
    <GlobalStyles />
    <RecipeInterpreter recipe={recipe} />
  </WithProviders>
)
