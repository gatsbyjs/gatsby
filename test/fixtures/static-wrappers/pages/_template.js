import React from 'react'

export default class Template extends React.Component {
  static get propTypes () {
    return { children: React.PropTypes.any }
  }

  render () {
    return (
      <main>
        {this.props.children}
      </main>
    )
  }
}
