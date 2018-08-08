import React, { Component } from "react"
import { Location } from "@reach/router"
import { globalHistory } from "@reach/router/lib/history"
import qs from "qs"

class URLQuery extends Component {
  state = {}

  componentDidMount = () => {
    const {
      location: { search },
    } = this.props

    this.getDerivedStateFromQuery(search)

    this.unlisten = globalHistory.listen(({ search }) => {
      this.getDerivedStateFromQuery(search)
    })
  }

  componentWillUnmount = () => {
    this.unlisten()
  }

  getDerivedStateFromQuery = search => {
    const { filters } = qs.parse(search.replace(`?`, ``))

    this.setState(() => {
      return {
        filters: filters || [],
      }
    })
  }

  updateQuery = fn => {
    const {
      history: { push },
      location: { pathname },
    } = this.props

    const newQuery = fn(this.state)
    const queryString = qs.stringify(newQuery)

    push(`${pathname}?${queryString}`)
  }

  render = () => this.props.children(this.state, this.updateQuery)
}

const URLQueryWithLocation = props => (
  <Location>
    {({ location }) => <URLQuery {...props} location={location} />}
  </Location>
)

export default URLQueryWithLocation
