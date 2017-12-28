import React from "react"
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"
import jsonp from "jsonp"

// Mailchimp endpoint
// From: https://us17.admin.mailchimp.com/lists/integration/embeddedcode?id=XXXXXX
// Where `XXXXXX` is the MC list ID
// Note: we change `/post` to `/post-json`
const MAILCHIMP_URL = `https://gatsbyjs.us17.list-manage.com/subscribe/post-json?u=1dc33f19eb115f7ebe4afe5ee&amp;id=f366064ba7`

class EmailCaptureForm extends React.Component {
  state = {
    email: ``,
  }

  // Update state each time user edits their email address
  _handleEmailChange = e => {
    this.setState({ email: e.target.value })
  }

  // Check whether the email address is valid
  // 1) not an empty string
  // 2) greater than 5 characters
  // 3) includes both a `@` and `.`
  _isValidEmailAddress = email =>
    !!email && email.length > 5 && (email.includes(`@`) && email.includes(`.`))

  _handleFormSubmit = e => {
    e.preventDefault()
    e.stopPropagation()

    // If email is not valid, break early
    if (!this._isValidEmailAddress(this.state.email)) {
      this.setState({
        status: `error`,
        msg: `${this.state.email} is not a valid email address`,
      })
      return
    }

    // Construct the url for our jsonp request
    // Query params must be in CAPS
    const url = `${MAILCHIMP_URL}
      &EMAIL=${encodeURIComponent(this.state.email)}
      &PATHNAME=${window.location.pathname}
    `

    this.setState(
      {
        msg: null,
        status: `sending`,
      },
      // setState callback (jsonp)
      () =>
        jsonp(
          url,
          {
            param: `c`,
          },
          // jsonp callback
          (err, data) => {
            if (err) {
              this.setState({
                status: `error`,
                msg: err,
              })
            } else if (data.result !== `success`) {
              this.setState({
                status: `error`,
                msg: data.msg,
              })
            } else {
              this.setState({
                status: `success`,
                msg: data.msg,
              })
            }
          }
        )
    )
  }

  render() {
    return (
      <div
        css={{
          border: `2px solid ${presets.brand}`,
          backgroundColor: presets.veryLightPurple,
          borderRadius: `4px`,
          padding: `${rhythm(0.75)}`,
        }}
        >
        {this.state.status === `success` ? (
          <div>Thank you! Youʼll receive your first email shortly.</div>
        ) : (
          <div>
            Enjoyed this post? Receive the next one in your inbox!
            <br />
            <form id="email-capture" method="post" noValidate css={{margin: 0}}>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    onChange={this._handleEmailChange}
                    css={{
                      marginTop: rhythm(0.3),
                      padding: `${rhythm(0.3)} ${rhythm(0.3)} ${rhythm(
                        0.3
                      )} ${rhythm(0.7)}`,
                      width: `250px`,
                    }}
                  />
                  <button
                    type="submit"
                    onClick={this._handleFormSubmit}
                    css={{
                      borderRadius: `2px`,
                      border: `2px solid ${presets.brand}`,
                      backgroundColor: presets.brand,
                      color: `black`,
                      height: `43px`,
                      padding: `0 ${rhythm(0.75)} 0 ${rhythm(0.75)}`,
                      margin: `${rhythm(0.75)} 0 0 ${rhythm(0.75)}`,
                    }}
                  >
                    Subscribe
                  </button>
                  {this.state.status === `error` && (
                    <div
                      dangerouslySetInnerHTML={{ __html: this.state.msg }}
                      css={{ marginTop: `${rhythm(0.5)}` }}
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
