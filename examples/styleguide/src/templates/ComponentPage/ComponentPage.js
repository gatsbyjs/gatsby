import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import Example from "./components/Example"

class ComponentPage extends React.Component {
  render() {
    const { displayName, props, html, description } = this.props.pageContext

    return (
      <div>
        <h1>{displayName}</h1>
        <p>{description.text}</p>
        <h2>Props/Methods</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {props.map(({ name, description, type, required }, index) => (
              <tr key={index}>
                <td>{name}</td>
                <td>{description.text}</td>
                <td>{type.name}</td>
                <td>{String(Boolean(required))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Example html={html} />
        <p>
          <Link to="/components/">[index]</Link>
        </p>
      </div>
    )
  }
}

ComponentPage.propTypes = {
  pageContext: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    props: PropTypes.array.isRequired,
    html: PropTypes.string.isRequired,
    description: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }),
  }).isRequired,
}

export default ComponentPage
