import React from "react"
import PropTypes from "prop-types"
import GatsbyLink from "gatsby-link"

import Example from "./components/Example"

class ComponentPage extends React.Component {
  render() {
    const { displayName, props, html, description } = this.props.pathContext

    return (
      <div>
        <h1>{displayName}</h1>
        <h2>Props/Methods</h2>
        <p>{description.text}</p>
        <ul>
          {props.map(({ name, description, type, required }, index) => (
            <li key={index}>
              <p>
                <strong>
                  <em>{name}</em>
                </strong>
              </p>
              <ul>
                <li>
                  <p>{description.text}</p>
                </li>
                <li>
                  <p>
                    <em>Type:</em> {type.name}
                  </p>
                </li>
                <li>
                  <p>
                    <em>Required:</em> {String(required)}
                  </p>
                </li>
              </ul>
            </li>
          ))}
        </ul>
        <Example html={html} />
        <p>
          <GatsbyLink to="/components/">[index]</GatsbyLink>
        </p>
      </div>
    )
  }
}

ComponentPage.propTypes = {
  pathContext: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    props: PropTypes.array.isRequired,
    html: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
}

export default ComponentPage
