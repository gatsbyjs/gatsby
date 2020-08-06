/** @jsx jsx */
import { jsx, Styled } from "theme-ui"
import {
  TextAreaField,
  TextAreaFieldControl,
  Heading,
  InputField,
  InputFieldLabel,
  InputFieldControl,
} from "gatsby-interface"
import MDX from "gatsby-recipes/src/components/mdx"
import CodeDiff from "./code-diff"
import { components, removeJsx, makeResourceId } from "./utils"

const ResourcePlan = ({ resourcePlan, isLastPlan }) => (
  <div id={makeResourceId(resourcePlan)} sx={{}}>
    <div>
      <Styled.p sx={{ mb: resourcePlan.diff ? 6 : 0 }}>
        <Styled.em>{resourcePlan.resourceName}</Styled.em>
        {` `}—{` `}
        {resourcePlan.describe}
      </Styled.p>
    </div>
    <CodeDiff resourcePlan={resourcePlan} />
    {resourcePlan.resourceChildren
      ? resourcePlan.resourceChildren.map(resource => (
          <ResourcePlan key={resource._uuid} resourcePlan={resource} />
        ))
      : null}
  </div>
)

const Step = ({ sendEvent, sendInputEvent, state, step, i }) => {
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

export default Step
