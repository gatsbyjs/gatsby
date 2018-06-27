import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"
import Helmet from "react-helmet"

import "./index.css"

const Header = ({ name }) => (
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
          {`${name.firstName} ${name.lastName}`}
        </Link>
      </h1>
    </div>
  </div>
)

const TemplateWrapper = ({ data, children }) => (
  <div>
    <Helmet
      title="Gatsby Default Starter"
      meta={[
        { name: `description`, content: `Sample` },
        { name: `keywords`, content: `sample, something` },
      ]}
    />
    <Header name={data.personalData.name} />

    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `0px 1.0875rem 1.45rem`,
        paddingTop: 0,
      }}
    >
      {children()}
    </div>
  </div>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper

export const query = graphql`
  query NameQuery {
    personalData {
      id
      name {
        firstName
        lastName
      }
    }
  }
`
