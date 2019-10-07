import React, { Component, Fragment } from "react"
import queryString from "query-string"
import { navigate } from "@reach/router"

const emptySearchState = { s: ``, c: [], d: [], v: [], sort: `recent` }
class RRSM extends Component {
  state = emptySearchState

  static defaultProps = {
    defaultSearchState: {},
  }

  setUrlState = newState => {
    const finalState = { ...this.state, ...newState }
    // update RSSM state
    this.setState({ ...finalState })

    // sync url to RSSM
    const params = Object.keys(finalState).reduce((merged, key) => {
      // right now the sort behavior is default, it doesn't show in the url
      if (finalState[key] && key !== `sort`) {
        merged[key] = finalState[key]
      }
      return merged
    }, {})

    return navigate(`${location.pathname}?${queryString.stringify(params)}`)
  }

  componentDidMount() {
    const urlState = queryString.parse(location.search)

    // if urlState is empty, default to v2
    if (Object.keys(urlState).length === 0) {
      return this.setUrlState(this.props.defaultSearchState)
    }

    // otherwise, set to urlState
    return this.setUrlState(urlState)
  }

  render() {
    const { render } = this.props
    return (
      <Fragment>
        {render({
          setURLState: this.setUrlState,
          urlState: this.state,
        })}
      </Fragment>
    )
  }
}

export default RRSM
