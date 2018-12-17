import React from "react"
import styled from "react-emotion"

import SendIcon from "react-icons/lib/md/send"

import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import { formInput } from "../utils/form-styles"
import { buttonStyles } from "../utils/styles"

const StyledForm = styled(`form`)`
  margin: 0;

  ${presets.Desktop} {
    display: ${props => (props.isHomepage ? `flex` : `block`)};
  }
`

const Label = styled(`label`)`
  :after {
    content: ${props => (props.isRequired ? `'*'` : ``)};
    color: ${colors.warning};
  }
`

const SingleLineInput = styled(`input`)`
  ${formInput};
  width: 100%;

  :focus {
    border-color: ${colors.gatsby};
    outline: 0;
    box-shadow: 0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)};
  }
`

const SingleLineInputOnHomepage = styled(SingleLineInput)`
  font-family: ${options.systemFontFamily.join(`,`)};
  font-size: 1rem;
  padding: 0.6rem;
`

const ErrorMessage = styled(`div`)`
  color: ${colors.warning};
  font-family: ${options.systemFontFamily.join(`,`)};
  font-size: 0.875rem;
  margin: calc(1.05rem / 2) 0;
`

const SuccesMessage = styled(`div`)`
  font-family: ${options.systemFontFamily.join(`,`)};
`

const Submit = styled(`input`)`
  ${buttonStyles.default};
  margin-top: 20px;
`

const SubmitOnHomepage = styled(`button`)`
  ${buttonStyles.default};
  font-size: 1.125rem;
  width: 100%;
  margin-top: 10px;

  span {
    align-items: center;
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  ${presets.Desktop} {
    width: auto;
    margin-top: 0;
    margin-left: 0.5rem;
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
          innerRef={input => {
            this.email = input
          }}
          aria-label={isHomepage ? `Email` : ``}
          placeholder={isHomepage ? `your.email@example.com` : ``}
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
    const { signupMessage, overrideCSS, isHomepage, className } = this.props

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
      <React.Fragment>
        {isHomepage ? (
          <div className={className}>
            {this.state.successMessage ? (
              <SuccesMessage
                dangerouslySetInnerHTML={{ __html: this.state.successMessage }}
              />
            ) : (
              <FormComponent isHomepage={true} />
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
                  <FormComponent />
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
  isHomepage: false,
  className: ``,
}

export default EmailCaptureForm
