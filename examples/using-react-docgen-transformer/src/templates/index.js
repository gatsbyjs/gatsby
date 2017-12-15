import React from "react"
import GatsbyLink from "gatsby-link"

class IndexComponent extends React.Component {
  render() {
    const { allComponents } = this.props.pathContext
    return (
      <div>
        <h1>Hello, world!</h1>
        <ul>
          {allComponents.map(({ displayName, path }, index) => (
            <li key={index}>
              <GatsbyLink to={path}>{displayName}</GatsbyLink>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default IndexComponent
