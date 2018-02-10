import React from "react"
import { rhythm, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"
import jsonp from "jsonp"
import { validate } from "email-validator"
import { css } from "glamor"
import hex2rgba from "hex2rgba"

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

// Mailchimp endpoint
// From: https://us17.admin.mailchimp.com/lists/integration/embeddedcode?id=XXXXXX
// Where `XXXXXX` is the MC list ID
// Note: we change `/post` to `/post-json`
const MAILCHIMP_URL = `https://gatsbyjs.us17.list-manage.com/subscribe/post-json?u=1dc33f19eb115f7ebe4afe5ee&amp;id=f366064ba7`

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

  // Using jsonp, post to MC server & handle its response
  _postEmailToMailchimp = url => {
    // jsonp lib takes an `endpoint`, {options}, & callback
    jsonp(url, { param: `c` }, (err, data) => {
      // network failures, timeouts, etc
      if (err) {
        this.setState({
          status: `error`,
          msg: err,
        })

        // Mailchimp errors & failures
      } else if (data.result !== `success`) {
        this.setState({
          status: `error`,
          msg: data.msg,
        })

        // Posted email successfully to Mailchimp
      } else {
        this.setState({
          status: `success`,
          msg: data.msg,
        })
      }
    })
  }

  // On form submit, validate email
  // then jsonp to Mailchimp, and update state
  _handleFormSubmit = e => {
    e.preventDefault()
    e.stopPropagation()

    // If email is not valid, break early
    if (!validate(this.state.email)) {
      this.setState({
        status: `error`,
        msg: `"${this.state.email}" is not a valid email address`,
      })
      return
    }

    // Construct the url for our jsonp request
    // Query params must be in CAPS
    // Capture pathname for better email targeting
    const url = `${MAILCHIMP_URL}
      &EMAIL=${encodeURIComponent(this.state.email)}
      &PATHNAME=${window.location.pathname}
    `

    this.setState(
      {
        msg: null,
        status: `sending`,
      },
      // jsonp request as setState callback
      this._postEmailToMailchimp(url)
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
