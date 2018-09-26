import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

class Dev404Page extends React.Component {
  static propTypes = {
    pages: PropTypes.arrayOf(PropTypes.object),
    custom404: PropTypes.element,
    location: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = { showCustom404: false }
    this.showCustom404 = this.showCustom404.bind(this)
  }

  showCustom404() {
    this.setState({ showCustom404: true })
  }

  render() {
    const { pathname } = this.props.location
    const pages = this.props.pages.filter(
      p => !/^\/dev-404-page\/$/.test(p.path)
    )
    let newFilePath
    if (pathname === `/`) {
      newFilePath = `src/pages/index.js`
    } else if (pathname.slice(-1) === `/`) {
      newFilePath = `src/pages${pathname.slice(0, -1)}.js`
    } else {
      newFilePath = `src/pages${pathname}.js`
    }

    return this.state.showCustom404 ? (
      this.props.custom404
    ) : (
      <div>
        <h1>Gatsby.js development 404 page</h1>
        <p>
          {`There's not a page yet at `}
          <code>{pathname}</code>
        </p>
        {this.props.custom404 ? (
          <p>
            <button onClick={this.showCustom404}>Preview custom 404 page</button>
          </p>
        ) : (
          <p>
            {`A custom 404 page wasn't detected - if you would like to add one, create a component in your site directory at `}
            <code>src/pages/404.js</code>.
          </p>
        )}
        <p>
          Create a React.js component in your site directory at
          {` `}
          <code>{newFilePath}</code>
          {` `}
          and this page will automatically refresh to show the new page
          component you created.
        </p>
        {pages.length > 0 && (
          <div>
            <p>
              If you were trying to reach another page, perhaps you can find it
              below.
            </p>
            <h2>Pages ({pages.length})</h2>
            <ul>
              {pages.map(page => (
                <li key={page.path}>
                  <Link to={page.path}>{page.path}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
}

export default Dev404Page
