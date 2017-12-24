import React from "react"
import { rhythm } from "../utils/typography"
import presets from "../utils/presets"

class EmailCaptureForm extends React.Component {
  constructor() {
    super()
    this.state = {
      email: ``,
    }
  }

  render() {
    return (
      <div
        css={{
          border: `2px solid ${presets.brand}`,
          backgroundColor: presets.veryLightPurple,
          borderRadius: `4px`,
          padding: `${rhythm(0.75)} 0 0 ${rhythm(0.75)}`,
        }}
      >
        Enjoyed this post? Receive the next in your inbox!
        <br />
        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            this.setState({
              email: e.target[`email`].value,
              pathname: window.location.pathname,
            })
          }}
        >
          {this.state.email ? (
            <div
              css={{
                padding: `${rhythm(0.15)} 0 ${rhythm(0.15)} 0`,
              }}
            >
              Thank you! Youʼll receive your first email shortly.
            </div>
          ) : (
            <div>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                css={{
                  marginTop: rhythm(0.3),
                  padding: `${rhythm(0.3)} ${rhythm(0.3)} ${rhythm(
                    0.3
                  )} ${rhythm(0.7)}`,
                  width: `250px`,
                }}
              />
              <input
                type="submit"
                css={{
                  borderRadius: `2px`,
                  border: `2px solid ${presets.brand}`,
                  backgroundColor: presets.brand,
                  color: `black`,
                  height: `43px`,
                  padding: `0 ${rhythm(0.75)} 0 ${rhythm(0.75)}`,
                  margin: `${rhythm(0.75)} 0 0 ${rhythm(0.75)}`,
                }}
              />
            </div>
          )}
        </form>
      </div>
    )
  }
}

export default EmailCaptureForm
