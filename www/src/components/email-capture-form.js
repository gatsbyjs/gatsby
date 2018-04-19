import React from "react"
import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import { css } from "glamor"
import hex2rgba from "hex2rgba"
import addToMailchimp from 'gatsby-plugin-mailchimp'

let stripeAnimation = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

const formInputDefaultStyles = {
  backgroundColor: `#fff`,
  border: `1px solid ${colors.ui.bright}`,
  borderRadius: presets.radius,
  color: colors.brand,
  fontFamily: options.headerFontFamily.join(`,`),
  padding: rhythm(1 / 2),
  verticalAlign: `middle`,
  transition: `all ${presets.animation.speedDefault} ${
    presets.animation.curveDefault
  }`,
  "::placeholder": {
    color: colors.lilac,
    opacity: 1,
  },
}

class EmailCaptureForm extends React.Component {
  constructor() {
    super()
    this.state = {
      email: ``,
    }
  }

  // Update state each time user edits their email address
  _handleEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  // Post to MC server & handle its response
  _postEmailToMailchimp = (email, attributes) => {
    addToMailchimp(email, attributes)
    .then(result => {
      // Mailchimp always returns a 200 response
      // So we check the result for MC errors & failures
      if (result.result !== `success`) {
        this.setState({
          status: `error`,
          msg: result.msg,
        })
      } else {
        // Email address succesfully subcribed to Mailchimp
        this.setState({
          status: `success`,
          msg: result.msg,
        })
      }
    })
    .catch(err => {
      // Network failures, timeouts, etc
      this.setState({
        status: `error`,
        msg: err,
      })
    })
  }

  _handleFormSubmit = e => {
    e.preventDefault()
    e.stopPropagation()

    this.setState({
        status: `sending`,
        msg: null,
      },
      // setState callback (subscribe email to MC)
      this._postEmailToMailchimp(this.state.email, {
        pathname: document.location.pathname,
      })
    )
  }

  render() {
    return (
      <div
        css={{
          borderTop: `2px solid ${colors.lilac}`,
          marginTop: rhythm(3),
          paddingTop: `${rhythm(1)}`,
        }}
      >
        {this.state.status === `success` ? (
          <div>Thank you! Youʼll receive your first email shortly.</div>
        ) : (
          <div>
            <p>Enjoyed this post? Receive the next one in your inbox!</p>
            <form
              id="email-capture"
              method="post"
              noValidate
              css={{ margin: 0 }}
            >
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  onChange={this._handleEmailChange}
                  css={{
                    ...formInputDefaultStyles,
                    width: `250px`,
                    ":focus": {
                      borderColor: colors.gatsby,
                      outline: 0,
                      boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
                    },
                  }}
                />
                <button
                  type="submit"
                  onClick={this._handleFormSubmit}
                  css={{
                    ...formInputDefaultStyles,
                    borderColor: colors.gatsby,
                    color: colors.gatsby,
                    cursor: `pointer`,
                    fontWeight: `bold`,
                    marginLeft: rhythm(1 / 2),
                    ":hover, &:focus": {
                      backgroundSize: `30px 30px`,
                      backgroundColor: colors.gatsby,
                      backgroundImage: `linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
                      color: `#fff`,
                      animation: `${stripeAnimation} 2.8s linear infinite`,
                    },
                    ":focus": {
                      outline: 0,
                      boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
                    },
                  }}
                >
                  Subscribe
                </button>
                {this.state.status === `error` && (
                  <div
                    dangerouslySetInnerHTML={{ __html: this.state.msg }}
                    css={{ marginTop: `${rhythm(1 / 2)}` }}
                  />
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }
}

export default EmailCaptureForm
