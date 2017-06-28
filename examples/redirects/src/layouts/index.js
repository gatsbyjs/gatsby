import React from 'react'
import Link from 'gatsby-link'

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <Link to="/">
          <h3>
            Example showing redirects
          </h3>
        </Link>
        <p>Navigate to <Link to="/redirect/">/redirect</Link>. It should redirect you :).</p>
        <ul>
          <li><Link to="/a/">a</Link></li>
          <li><Link to="/b/">b</Link></li>
          <li><Link to="/c/">c</Link></li>
        </ul>
        {this.props.children()}
      </div>
    )
  }
}

export default DefaultLayout
