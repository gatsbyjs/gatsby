/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import styled from "@emotion/styled"

import SendIcon from "react-icons/lib/md/send"

import { mediaQueries } from "../gatsby-plugin-theme-ui"
import { themedInput, formInputFocus, buttonStyles } from "../utils/styles"
import { rhythm } from "../utils/typography"

const Container = styled(`div`)`
  background: ${p => p.theme.colors.newsletter.background};
  box-shadow: ${p => p.theme.shadows.floating},
    inset 0 0 0 1px ${p => p.theme.colors.newsletter.border};
  border-radius: ${p => p.theme.radii[2]}px;
  margin-top: ${p => p.theme.space[8]};
  padding: calc(${p => p.theme.space[6]} * 1.2);
  padding-bottom: calc(
    ${props => rhythm(props.theme.space[6] * 1.2)} + ${p => p.theme.space[1]}
  );
  position: relative;

  :after {
    border-radius: 0 0 ${p => p.theme.radii[2]}px ${p => p.theme.radii[2]}px;
    background: ${p => p.theme.colors.newsletter.background}
      repeating-linear-gradient(
        135deg,
        ${p => p.theme.colors.newsletter.stripeColorA},
        ${p => p.theme.colors.newsletter.stripeColorA} 20px,
        transparent 20px,
        transparent 40px,
        ${p => p.theme.colors.newsletter.stripeColorB} 40px,
        ${p => p.theme.colors.newsletter.stripeColorB} 60px,
        transparent 60px,
        transparent 80px
      );
    bottom: 0;
    content: "";
    height: ${p => p.theme.space[1]};
    left: 0;
    right: 0;
    position: absolute;
  }

  ${mediaQueries.lg} {
    flex-direction: row;
    justify-content: space-between;

    > * {
      flex-basis: 50%;
    }
  }
`

const StyledForm = styled(`form`)`
  margin: 0;

  ${mediaQueries.lg} {
    display: ${props => (props.isHomepage ? `flex` : `block`)};
  }
`

const Label = styled(`label`)`
  font-size: ${p => p.theme.fontSizes[1]};
  :after {
    content: ${props => (props.isRequired ? `'*'` : ``)};
    color: ${p => p.theme.colors.textMuted};
  }
`

const ErrorMessage = styled(`div`)`
  color: ${p => p.theme.colors.warning};
  font-family: ${p => p.theme.fonts.system};
  font-size: ${p => p.theme.fontSizes[1]};
  margin: ${p => p.theme.space[2]} 0;
`

const SuccessMessage = styled(`div`)`
  font-family: ${p => p.theme.fonts.system};
`

function Form({ isHomepage, portalId, formId, sfdcCampaignId, onSuccess }) {
  const emailRef = React.useRef(null)
  const [errorMessage, setErrorMessage] = React.useState("")
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
        if (xhr.readyState == 4) {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status == 200) {
            // https://developers.hubspot.com/docs/methods/forms/submit_form_ajax
            // docs mention response should "thankYouMessage" field,
            // but I get inlineMessage in my testing
            onSuccess(response.thankYouMessage || response.inlineMessage)
          } else {
            let errorMessage,
              fieldErrors = {}
            if (response.errors) {
              // {"message":"Error in 'fields.email'. Invalid email address","errorType":"INVALID_EMAIL"}
              // {"message":"Error in 'fields.email'. Required field 'email' is missing","errorType":"REQUIRED_FIELD"}

              const errorRe = /^Error in 'fields.([^']+)'. (.+)$/
              response.errors.map(error => {
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
    <StyledForm onSubmit={onSubmit} isHomepage={isHomepage}>
      {!isHomepage && (
        <Label isRequired htmlFor="email">
          Email
        </Label>
      )}
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        ref={emailRef}
        aria-label={isHomepage ? `Email` : ``}
        placeholder={`your.email@example.com`}
        sx={{
          ...themedInput,
          width: `100%`,
          "&:focus": {
            ...formInputFocus,
          },
        }}
      />
      {fieldErrors.email && <ErrorMessage>{fieldErrors.email}</ErrorMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {isHomepage ? (
        <button
          type="submit"
          sx={{
            ...buttonStyles().default,
            fontSize: 3,
            mt: 3,
            width: `100%`,
            span: {
              alignItems: `center`,
              display: `flex`,
              justifyContent: `space-between`,
              width: `100%`,
            },
            [mediaQueries.lg]: {
              ml: 2,
              mt: 0,
              width: `auto`,
            },
          }}
        >
          <span>
            Subscribe
            <SendIcon />
          </span>
        </button>
      ) : (
        <input
          type="submit"
          value="Subscribe"
          sx={{
            ...buttonStyles().default,
            mt: 3,
          }}
        />
      )}
    </StyledForm>
  )
}

function EmailCaptureForm({
  formId = "089352d8-a617-4cba-ba46-6e52de5b6a1d",
  signupMessage = `Enjoyed this post? Receive the next one in your inbox!`,
  isHomepage = false,
  className = ``,
}) {
  const [successMessage, setSuccessMessage] = React.useState("")

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
    <React.Fragment>
      {isHomepage ? (
        <div className={className}>
          {successMessage ? (
            <SuccessMessage
              dangerouslySetInnerHTML={{ __html: successMessage }}
            />
          ) : (
            <FormComponent isHomepage={true} />
          )}
        </div>
      ) : (
        <Container>
          <p
            sx={{
              color: `newsletter.heading`,
              fontWeight: `bold`,
              fontSize: 3,
              fontFamily: `header`,
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
      )}
    </React.Fragment>
  )
}

export default EmailCaptureForm
