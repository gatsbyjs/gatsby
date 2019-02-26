import React, { Fragment } from "react"
import { Helmet } from "react-helmet"
import cxs from "cxs"

// Create a Title component that'll render an <h1> tag with some styles
const titleClassName = cxs({
  fontSize: `1.5em`,
  textAlign: `center`,
  color: `palevioletred`,
})

// Create a Wrapper component that'll render a <section> tag with some styles
const wrapperClassName = cxs({
  padding: `4em`,
  background: `papayawhip`,
})

class IndexPage extends React.Component {
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Gatsby Styled Components</title>
          <meta
            name="description"
            content="Gatsby example site using Styled Components"
          />
          <meta name="referrer" content="origin" />
        </Helmet>
        <div
          style={{
            margin: `0 auto`,
            marginTop: `3rem`,
            padding: `1.5rem`,
            maxWidth: 800,
            color: `red`,
          }}
        >
          <div className={wrapperClassName}>
            <div className={titleClassName}>
              Hello World, this is my first styled component!
            </div>
            <p>
              <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-styled-components/">
                gatsby-plugin-styled-component docs
              </a>
            </p>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default IndexPage
