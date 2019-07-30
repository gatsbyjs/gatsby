/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import styled from "@emotion/styled"

import SendIcon from "react-icons/lib/md/send"

import { mediaQueries } from "../gatsby-plugin-theme-ui"
import { formInput, formInputFocus, buttonStyles } from "../utils/styles"
import { rhythm } from "../utils/typography"

const Container = styled(`div`)`
  background: ${props => props.theme.colors.purple[5]};
  box-shadow: ${props => props.theme.shadows.raised},
    inset 0 0 0 1px ${props => props.theme.colors.purple[10]};
  border-radius: ${props => props.theme.radii[2]}px;
  margin-top: ${props => props.theme.space[8]};
  padding: calc(${props => props.theme.space[6]} * 1.2);
  padding-bottom: calc(
    ${props => rhythm(props.theme.space[6] * 1.2)} +
      ${props => props.theme.space[1]}
  );
  position: relative;

  :after {
    border-radius: 0 0 ${props => props.theme.radii[2]}px
      ${props => props.theme.radii[2]}px;
    background: ${props => props.theme.colors.white}
      repeating-linear-gradient(
        135deg,
        ${props => props.theme.colors.red[40]},
        ${props => props.theme.colors.red[40]} 20px,
        transparent 20px,
        transparent 40px,
        ${props => props.theme.colors.blue[40]} 40px,
        ${props => props.theme.colors.blue[40]} 60px,
        transparent 60px,
        transparent 80px
      );
    bottom: 0;
    content: "";
    height: ${props => props.theme.space[1]};
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
  font-size: ${props => props.theme.fontSizes[1]};
  :after {
    content: ${props => (props.isRequired ? `'*'` : ``)};
    color: ${props => props.theme.colors.text.secondary};
  }
`

const SingleLineInput = styled(`input`)`
  ${formInput};
  border-color: ${props => props.theme.colors.purple[20]};
  width: 100%;
  -webkit-appearance: none;

  :focus {
    ${formInputFocus}
  }
`

const SingleLineInputOnHomepage = styled(SingleLineInput)`
  font-family: ${props => props.theme.fonts.system};
  font-size: ${props => props.theme.fontSizes[2]};
  padding: ${props => props.theme.space[2]};
`

const ErrorMessage = styled(`div`)`
  color: ${props => props.theme.colors.warning};
  font-family: ${props => props.theme.fonts.system};
  font-size: ${props => props.theme.fontSizes[1]};
  margin: ${props => props.theme.space[2]} 0;
`

const SuccessMessage = styled(`div`)`
  font-family: ${props => props.theme.fonts.system};
`

const Submit = styled(`input`)`
  ${buttonStyles.default};
  margin-top: ${props => props.theme.space[3]};
`

const SubmitOnHomepage = styled(`button`)`
  ${buttonStyles.default};
  font-size: ${props => props.theme.fontSizes[3]};
  width: 100%;
  margin-top: ${props => props.theme.space[3]};

  span {
    align-items: center;
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  ${mediaQueries.lg} {
    width: auto;
    margin-top: 0;
    margin-left: ${props => props.theme.space[2]};
  }
`

class Form extends React.Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)

    // let's use uncontrolled components https://reactjs.org/docs/uncontrolled-components.html
    this.email = null
  }

  state = {
    errorMessage: ``,
    fieldErrors: {},
  }

  onSubmit(e) {
    e.preventDefault()

    // validation here or use Formik or something like that
    // we can also rely on server side validation like I do right now

    const { portalId, formId, sfdcCampaignId } = this.props
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`
    const data = {
      fields: [
        {
          name: `email`,
          value: this.email.value,
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
          this.props.onSuccess(
            response.thankYouMessage || response.inlineMessage
          )
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

          this.setState({ fieldErrors, errorMessage })
        }
      }
    }

    xhr.send(JSON.stringify(data))
  }

  render() {
    const { isHomepage } = this.props

    const SingleLineInputComponent = isHomepage
      ? SingleLineInputOnHomepage
      : SingleLineInput

    return (
      <StyledForm onSubmit={this.onSubmit} isHomepage={isHomepage}>
        {!isHomepage && (
          <Label isRequired htmlFor="email">
            Email
          </Label>
        )}
        <SingleLineInputComponent
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          ref={input => {
            this.email = input
          }}
          aria-label={isHomepage ? `Email` : ``}
          placeholder={`your.email@example.com`}
        />
        {this.state.fieldErrors.email && (
          <ErrorMessage>{this.state.fieldErrors.email}</ErrorMessage>
        )}
        {this.state.errorMessage && (
          <ErrorMessage>{this.state.errorMessage}</ErrorMessage>
        )}

        {isHomepage ? (
          <SubmitOnHomepage type="submit">
            <span>
              Subscribe
              <SendIcon />
            </span>
          </SubmitOnHomepage>
        ) : (
          <Submit type="submit" value="Subscribe" />
        )}
      </StyledForm>
    )
  }
}

class EmailCaptureForm extends React.Component {
  constructor(props) {
    super(props)
    this.onSuccess = this.onSuccess.bind(this)
  }

  state = {
    successMessage: ``,
  }

  onSuccess(successMessage) {
    this.setState({ successMessage })
  }

  render() {
    const { signupMessage, isHomepage, className } = this.props

    const FormComponent = props => (
      <Form
        onSuccess={this.onSuccess}
        portalId="4731712"
        formId="089352d8-a617-4cba-ba46-6e52de5b6a1d"
        sfdcCampaignId="701f4000000Us7pAAC"
        {...props}
      />
    )

    return (
      <>
        {isHomepage ? (
          <div className={className}>
            {this.state.successMessage ? (
              <SuccessMessage
                dangerouslySetInnerHTML={{ __html: this.state.successMessage }}
              />
            ) : (
              <FormComponent isHomepage={true} />
            )}
          </div>
        ) : (
          <Container>
            <p
              sx={{
                color: `gatsby`,
                fontWeight: `bold`,
                fontSize: 3,
                fontFamily: `header`,
                lineHeight: `dense`,
              }}
            >
              {signupMessage}
            </p>
            {this.state.successMessage ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: this.state.successMessage,
                }}
              />
            ) : (
              <FormComponent />
            )}
          </Container>
        )}
      </>
    )
  }
}

EmailCaptureForm.defaultProps = {
  signupMessage: `Enjoyed this post? Receive the next one in your inbox!`,
  confirmMessage: `Thank you! Youʼll receive your first email shortly.`,
  isHomepage: false,
  className: ``,
}

export default EmailCaptureForm
