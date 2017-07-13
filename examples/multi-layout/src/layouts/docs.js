import React from "react"
import Link from "gatsby-link"

class DocsLayout extends React.Component {
  render() {
    return (
      <div style={{
        background: '#F7C59F',
        minHeight: '100vh'
      }}>
        <h3>This is the docs layout</h3>
        <div style={{ float: 'left' , width: '30%'}}>
          <h2>Nav example</h2>
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
        <div style={{
          marginLeft: '15%',
          width: '70%' }}>
          {this.props.children()}
        </div>
      </div>
    )
  }
}

export default DocsLayout
