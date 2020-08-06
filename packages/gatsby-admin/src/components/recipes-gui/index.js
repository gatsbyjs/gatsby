/** @jsx jsx */
import React from "react"
import { useState } from "react"

import { jsx, Styled } from "theme-ui"
import "normalize.css"

import { InputProvider } from "gatsby-recipes/src/renderer/input-provider"
import { ResourceProvider } from "gatsby-recipes/src/renderer/resource-provider"
import { createUrqlClient } from "../../urql-client"
import { useMutation, useSubscription } from "urql"

import lodash from "lodash"
import fetch from "isomorphic-fetch"

import { Button, Heading } from "gatsby-interface"
import MDX from "gatsby-recipes/src/components/mdx"
import WelcomeMessage from "./welcome-message"
import Step from "./recipe-step"
import { components, removeJsx, log } from "./utils"
import ResourceMessage from "./resource-message"

//TODO: We need to be able to grab this dynamically
const PROJECT_ROOT = `/Users/laurie/Documents/Gatsby/gatsby/starters/blog`

const graphqlPort = 50400
const projectRoot = PROJECT_ROOT

const API_ENDPOINT = `http://localhost:${graphqlPort}`

let isSubscriptionConnected = false
let isRecipeStarted = false
let sessionId
let sendEvent

const checkServerSession = async () => {
  const response = await fetch(`${API_ENDPOINT}/session`)
  const newSessionId = await response.text()
  if (!sessionId) {
    sessionId = newSessionId
  } else if (newSessionId !== sessionId) {
    window.location.reload()
  }
}

const sendInputEvent = event => {
  sendEvent({
    event: `INPUT_ADDED`,
    input: event,
  })
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

const Spinner = () => <span>Loading...</span>

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
              <Step
                sendInputEvent={sendInputEvent}
                sendEvent={sendEvent}
                state={state}
                step={step}
                key={`step-${i}`}
                i={i}
              />
            ))}
          </Wrapper>
        </InputProvider>
      </ResourceProvider>
    </>
  )
}

export default ({ recipe }) => <RecipeInterpreter recipe={recipe} />
