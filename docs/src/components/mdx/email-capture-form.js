/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import styled from "@emotion/styled"
import { Button, InputFieldBlock } from "gatsby-interface"

const Container = styled(`div`)`
  background: ${p => p.theme.colors.primaryBackground};
  box-shadow: ${p => p.theme.shadows.floating},
    inset 0 0 0 1px ${p => p.theme.colors.grey[10]};
  border-radius: ${p => p.theme.radii[2]};
  margin-top: ${p => p.theme.space[8]};
  padding: calc(${p => p.theme.space[6]} * 1.2);
  padding-bottom: calc(
    ${props => props.theme.space[6] * 1.2} + ${p => p.theme.space[1]}
  );
  position: relative;

  ${p => p.theme.mediaQueries.desktop} {
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex-basis: 50%;
    }
  }
`

const StyledForm = styled(`form`)`
  margin: 0;

  ${p => p.theme.mediaQueries.desktop} {
    display: block;
  }
`

function Form({ portalId, formId, sfdcCampaignId, onSuccess }) {
  const emailRef = React.useRef(null)
  const [errorMessage, setErrorMessage] = React.useState(``)
  const [fieldErrors, setFieldErrors] = React.useState({})

  const onSubmit = React.useCallback(
    e => {
      e.preventDefault()

      // validation here or use Formik or something like that
      // we can also rely on server side validation like I do right now

      const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`
      const data = {
        fields: [
          {
            name: `email`,
            value: emailRef.current.value,
          },
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title,
        },
      }

      if (sfdcCampaignId) {
        data.context.sfdcCampaignId = sfdcCampaignId
      }

      const xhr = new XMLHttpRequest()
      xhr.open(`POST`, url, false)
      xhr.setRequestHeader(`Content-Type`, `application/json`)

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status === 200) {
            // https://developers.hubspot.com/docs/methods/forms/submit_form_ajax
            // docs mention response should "thankYouMessage" field,
            // but I get inlineMessage in my testing
            onSuccess(response.thankYouMessage || response.inlineMessage)
          } else {
            let errorMessage
            const fieldErrors = {}
            if (response.errors) {
              // {"message":"Error in 'fields.email'. Invalid email address","errorType":"INVALID_EMAIL"}
              // {"message":"Error in 'fields.email'. Required field 'email' is missing","errorType":"REQUIRED_FIELD"}

              const errorRe = /^Error in 'fields.([^']+)'. (.+)$/
              response.errors.forEach(error => {
                const [, fieldName, message] = errorRe.exec(error.message)
                fieldErrors[fieldName] = message
              })

              // hubspot use "The request is not valid" message, so probably better use custom one
              errorMessage = `Errors in the form`
            } else {
              errorMessage = response.message
            }

            setFieldErrors(fieldErrors)
            setErrorMessage(errorMessage)
          }
        }
      }

      xhr.send(JSON.stringify(data))
    },
    [portalId, formId, sfdcCampaignId]
  )

  return (
    <StyledForm onSubmit={onSubmit}>
      <InputFieldBlock
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        ref={emailRef}
        label="Email"
        placeholder="your.email@example.com"
        error={fieldErrors.email || errorMessage}
      />

      <Button type="submit" size="M" sx={{ mt: 5 }}>
        Subscribe
      </Button>
    </StyledForm>
  )
}

function EmailCaptureForm({
  formId = `089352d8-a617-4cba-ba46-6e52de5b6a1d`,
  signupMessage = `Enjoyed this post? Receive the next one in your inbox!`,
}) {
  const [successMessage, setSuccessMessage] = React.useState(``)

  const FormComponent = props => (
    <Form
      onSuccess={setSuccessMessage}
      portalId="4731712"
      formId={formId}
      sfdcCampaignId="701f4000000Us7pAAC"
      {...props}
    />
  )

  return (
    <Container>
      <p
        sx={{
          color: `grey.70`,
          fontWeight: `bold`,
          fontSize: 3,
          fontFamily: `heading`,
          lineHeight: `dense`,
        }}
      >
        {signupMessage}
      </p>
      {successMessage ? (
        <div
          dangerouslySetInnerHTML={{
            __html: successMessage,
          }}
        />
      ) : (
        <FormComponent />
      )}
    </Container>
  )
}

export default EmailCaptureForm
