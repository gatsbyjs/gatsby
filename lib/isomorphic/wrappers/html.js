import React, { Component } from 'react'
import { browserHistory } from 'react-router'

export default class HtmlWrapper extends Component {

  propTypes = {
    router: React.PropTypes.object,
  }

  componentDidMount () {
    this.refs.holder.addEventListener( 'click', this.onNodeClick )
  }

  componentWillUnmount () {
    this.refs.holder.removeEventListener( 'click', this.onNodeClick )
  }

  onNodeClick = ( e ) => {
    const node = e.target

    // Only accept links
    if ( node.tagName !== 'A' ) {
      return
    }

    const href = node.getAttribute( 'href' )

    // That are pointing to an internal page
    // All internal links should have a slash on the start and on the end
    // Example: /about/me/
    if ( ! href.match( /^\/.*\/$/ ) ) {
      return
    }

    // That doesn't have a data-react attribute
    if ( node.getAttribute( 'data-react' ) ) {
      return
    }

    // Seems that we've found a link that isn't being managed by react
    // Lets prevent browser default and propagation
    e.preventDefault()

    // And use react-router history instead
    browserHistory.push( node.href )
  }

  render () {
    const post = this.props.route.page.data

    return (
      <div ref="holder" dangerouslySetInnerHTML={{ __html: post.body }} />
    )
  }
}
