import React from "react"
import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import hex2rgba from "hex2rgba"
import { formInput } from "../utils/form-styles"
import { buttonStyles } from "../utils/styles"

const Label = props => (
  <label htmlFor={props.for}>
    {props.children}
    {props.isRequired && (
      <span
        css={{
          color: `red`,
          "&:before": {
            content: `'*'`,
            color: colors.warning,
          },
        }}
      />
    )}
  </label>
)

const SingleLineInput = React.forwardRef((props, ref) => (
  <input
    ref={ref}
    css={{
      ...formInput,
      width: `100% !important`,
      ":focus": {
        borderColor: colors.gatsby,
        outline: 0,
        boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
      },
    }}
    {...props}
  />
))

const ErrorMessage = ({ children }) => (
  <div
    css={{
      // dunno where this is comming from - just straight copied li style from dev tools
      marginBottom: `calc(1.05rem / 2)`,
      color: colors.warning,
      fontSize: rhythm(1 / 2),
    }}
  >
    {children}
  </div>
)

class Form extends React.Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)

    // let's use uncontrolled components https://reactjs.org/docs/uncontrolled-components.html
    this.email = React.createRef()
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
          value: this.email.current.value,
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
    return (
      <form onSubmit={this.onSubmit}>
        <div
          css={{
            paddingBottom: `20px`,
          }}
        >
          <Label isRequired for="email">
            Email
          </Label>
          <SingleLineInput
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            ref={this.email}
          />
          {this.state.fieldErrors.email && (
            <ErrorMessage>{this.state.fieldErrors.email}</ErrorMessage>
          )}
        </div>
        {this.state.errorMessage && (
          <ErrorMessage>{this.state.errorMessage}</ErrorMessage>
        )}
        <input type="submit" value="Subscribe" css={buttonStyles.default} />
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
    const { signupMessage, overrideCSS } = this.props

    return (
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
                dangerouslySetInnerHTML={{ __html: this.state.successMessage }}
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
    )
  }
}

EmailCaptureForm.defaultProps = {
  signupMessage: `Enjoyed this post? Receive the next one in your inbox!`,
  confirmMessage: `Thank you! Youʼll receive your first email shortly.`,
  overrideCSS: {},
}

export default EmailCaptureForm
