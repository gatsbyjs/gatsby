import React from "react"
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"
import jsonp from "jsonp"
import { validate } from "email-validator"
import { css } from "glamor"

let stripeAnimation = css.keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

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
          borderTop: `2px solid ${presets.brandLight}`,
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
                    padding: rhythm(1 / 2),
                    width: `250px`,
                    color: presets.bodyColor,
                  }}
                />
                <button
                  type="submit"
                  onClick={this._handleFormSubmit}
                  css={{
                    borderRadius: `2px`,
                    border: `1px solid ${presets.brand}`,
                    cursor: `pointer`,
                    padding: rhythm(1 / 2),
                    margin: `${rhythm(1 / 2)} 0 0 ${rhythm(1 / 2)}`,
                    ":hover": {
                      backgroundSize: `30px 30px`,
                      backgroundColor: presets.brand,
                      backgroundImage: `linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
                      color: `#fff`,
                      animation: `${stripeAnimation} 2.8s linear infinite`,
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
