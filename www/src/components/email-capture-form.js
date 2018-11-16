import React from "react"
import styled from "react-emotion"

import SendIcon from "react-icons/lib/md/send"

import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import { formInput } from "../utils/form-styles"
import { buttonStyles } from "../utils/styles"

const Label = styled(`label`)`
  :after {
    content: ${props => (props.isRequired ? `'*'` : "")};
    color: ${colors.warning};
  }
`

const SingleLineInput = styled(`input`)`
  ${formInput};
  width: 100%;

  ${props => {
    if (props.newStyle) {
      return `
        font-family: ${options.systemFontFamily.join(`,`)};
        font-size: 1rem;
        padding: .6rem;
      `
    }
  }};

  :focus {
    border-color: ${colors.gatsby};
    outline: 0;
    box-shadow: 0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)};
  }
`

const ErrorMessage = styled(`div`)`
  margin-bottom: calc(1.05rem / 2);
  color: ${colors.warning};
  fontsize: ${rhythm(1 / 2)};
`

const Submit = styled(`button`)`
  ${buttonStyles.default};

  ${props => {
    if (props.newStyle) {
      return `
        font-size: 1.25rem;
        width: 100%;

        span {
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
      `
    }
  }};
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
    const { newStyle = false } = this.props

    return (
      <form onSubmit={this.onSubmit}>
        <div css={{ paddingBottom: this.props.newStyle ? `10px` : `20px` }}>
          {!this.props.newStyle && (
            <Label isRequired htmlFor="email">
              Email
            </Label>
          )}
          <SingleLineInput
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            innerRef={input => {
              this.email = input
            }}
            placeholder={newStyle ? "your.email@example.com" : ""}
            newStyle={newStyle}
          />
          {this.state.fieldErrors.email && (
            <ErrorMessage>{this.state.fieldErrors.email}</ErrorMessage>
          )}
        </div>

        {this.state.errorMessage && (
          <ErrorMessage>{this.state.errorMessage}</ErrorMessage>
        )}
        <Submit type="1submit" newStyle={newStyle}>
          <span>
            Subscribe
            <SendIcon />
          </span>
        </Submit>
      </form>
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
    const { signupMessage, overrideCSS, newStyle } = this.props

    return (
      <React.Fragment>
        {newStyle ? (
          <div>
            {this.state.successMessage ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: this.state.successMessage,
                }}
              />
            ) : (
              <Form
                onSuccess={this.onSuccess}
                portalId="4731712"
                formId="089352d8-a617-4cba-ba46-6e52de5b6a1d"
                sfdcCampaignId="701f4000000Us7pAAC"
                newStyle={true}
              />
            )}
          </div>
        ) : (
          <div
            css={{
              borderTop: `2px solid ${colors.lilac}`,
              fontFamily: options.headerFontFamily.join(`,`),
              marginTop: rhythm(3),
              paddingTop: `${rhythm(1)}`,
              ...overrideCSS,
            }}
          >
            <div>
              <p>{signupMessage}</p>
              <div
                css={{
                  backgroundColor: colors.ui.light,
                  borderRadius: presets.radius,
                  color: colors.gatsby,
                  fontFamily: options.headerFontFamily.join(`,`),
                  padding: `15px`,
                }}
              >
                {this.state.successMessage ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: this.state.successMessage,
                    }}
                  />
                ) : (
                  <Form
                    onSuccess={this.onSuccess}
                    portalId="4731712"
                    formId="089352d8-a617-4cba-ba46-6e52de5b6a1d"
                    sfdcCampaignId="701f4000000Us7pAAC"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

EmailCaptureForm.defaultProps = {
  signupMessage: `Enjoyed this post? Receive the next one in your inbox!`,
  confirmMessage: `Thank you! Youʼll receive your first email shortly.`,
  overrideCSS: {},
  newStyle: false,
}

export default EmailCaptureForm
