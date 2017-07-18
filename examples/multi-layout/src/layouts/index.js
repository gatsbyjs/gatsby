import React from "react"
import Link from "gatsby-link"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div style={{background: '#46ACC2'}}>
        <div>
          <h3>This is the standard layout</h3>
          <div>
            <h2>{this.props.data.site.siteMetadata.dummy}</h2>
            <ul>
              <li>
                <Link to="/">home</Link>
              </li>
              <li>
                <Link to="/docs">docs</Link>
              </li>
              <li>
                <Link to="/about">about</Link>
              </li>
            </ul>
          </div>
        </div>
        {this.props.children()}
      </div>
    )
  }
}

export default DefaultLayout

export const query = graphql`
query	layoutQuery {
	site {
    siteMetadata {
      dummy
    }
  }
}
`
