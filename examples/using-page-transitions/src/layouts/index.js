import React from "react"
import { Link } from "gatsby"
import { Helmet } from "react-helmet"
import Transition from "../components/transition"

import "./layout.css"

const Header = () => (
  <div
    style={{
      background: `rebeccapurple`,
      marginBottom: `1.45rem`,
    }}
  >
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `1.45rem 1.0875rem`,
      }}
    >
      <h1 style={{ margin: 0 }}>
        <Link
          to="/"
          style={{
            color: `white`,
            textDecoration: `none`,
          }}
        >
          Gatsby
        </Link>
      </h1>
    </div>
  </div>
)

const TemplateWrapper = ({ children, location }) => (
  <div>
    <Helmet
      title="Gatsby Default Starter"
      meta={[
        { name: `description`, content: `Sample` },
        { name: `keywords`, content: `sample, something` },
      ]}
    />
    <Header />
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `0px 1.0875rem 1.45rem`,
        paddingTop: 0,
      }}
    >
      <Transition location={location}>{children}</Transition>
    </div>
  </div>
)

export default TemplateWrapper
