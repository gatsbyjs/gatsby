import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import "./layout.css"
import stripeLogo from "../images/powered_by_stripe.svg"

import "@stripe/stripe-js" // https://github.com/stripe/stripe-js#import-as-a-side-effect

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0px 1.0875rem 1.45rem`,
          paddingTop: 0,
        }}
      >
        {children}
        <footer>
          <div>
            Built by <a href="https://twitter.com/thorwebdev">Thor</a> with{" "}
            <a href="https://www.gatsbyjs.com">Gatsby</a> | View{" "}
            <a href="https://github.com/gatsbyjs/gatsby/tree/master/examples/ecommerce-tutorial-with-stripe">
              source
            </a>
          </div>
          <div>
            <a href="https://stripe.com">
              <img src={stripeLogo} alt="Payments powered by Stripe" />
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
