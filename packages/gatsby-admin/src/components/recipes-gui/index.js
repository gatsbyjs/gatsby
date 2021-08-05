/** @jsx jsx */
import React from "react"
import { useState } from "react"

import { jsx, Styled } from "theme-ui"

import { InputProvider } from "gatsby-recipes/src/renderer/input-provider"
import { ResourceProvider } from "gatsby-recipes/src/renderer/resource-provider"
import { createUrqlClient } from "../../urql-client"
import { useMutation, useSubscription } from "urql"

import lodash from "lodash"
import fetch from "cross-fetch"

import { Button, Heading } from "gatsby-interface"
import { StepRenderer } from "gatsby-recipes/components"
import WelcomeMessage from "./welcome-message"
import Step from "./recipe-step"
import { components, removeJsx, log } from "./utils"
import ResourceMessage from "./resource-message"

const isSubscriptionConnected = false
let isRecipeStarted = false
let sessionId
let sendEvent
let projectRoot
let apiEndpoint

const checkServerSession = async () => {
  const response = await fetch(`${apiEndpoint}/session`)
  const newSessionId = await response.text()
  if (!sessionId) {
    sessionId = newSessionId
  } else if (newSessionId !== sessionId) {
    window.location.reload()
  }
}

const Spinner = () => <span>Loading...</span>

function Wrapper({ children }) {
  return <div sx={{ maxWidth: 1000, margin: `0 auto` }}>{children}</div>
}

const ButtonText = state => {
  if (state.value === `done`) {
    return `Refresh State`
  }
  return `Install Recipe`
}

// recursive component, will continuously display children until there are none
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

const RecipeInterpreter = ({ recipe }) => {
  const [client, setClient] = useState(null)

  React.useEffect(() => {
    fetch(`/___services`)
      .then(res => res.json())
      .then(json => {
        if (json.metadata) projectRoot = json.metadata.sitePath
        if (json.recipesgraphqlserver) {
          apiEndpoint = `http://localhost:${json.recipesgraphqlserver.port}`
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
        <Spinner /> {recipe}
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

  if (isDone) {
    process.nextTick(() => {
      try {
        client.close()
      } catch {
        // do nothing here, this is throwing a type error despite running and being essential for this code
      }
      log(`${recipe} finished successfully`)
    })
  }

  const { plan, stepsAsJS, exports } = state.context

  const groupedPlansByResource = lodash.groupBy(plan, p => p.resourceName)

  return (
    <>
      <Styled.p>{` `}</Styled.p>
      <ResourceProvider
        value={plan?.filter(p => p.resourceDefinitions?._key) || []}
      >
        <InputProvider value={{}}>
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
                <StepRenderer
                  components={components}
                  scope={{ sendEvent }}
                  remarkPlugins={[removeJsx]}
                >
                  {exports?.join(`\n`) + `\n\n` + stepsAsJS[0]}
                </StepRenderer>
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
                {plan?.length}
                {` `}
                Changes
              </Heading>
              {Object.entries(groupedPlansByResource).map(
                ([resourceName, plans]) => (
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
                )
              )}
            </div>

            <Heading sx={{ mb: 6 }}>{stepsAsJS.length - 1} Steps</Heading>
            {stepsAsJS.slice(1).map((step, i) => (
              <Step
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
