import React, { Component } from "react"
import { Helmet } from "react-helmet"
import qs from "qs"
import { navigate } from "gatsby"
import scrollToAnchor from "../../utils/scroll-to-anchor"
import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"

class ShowcaseView extends Component {
  showcase = React.createRef()
  state = {
    filters: [],
  }

  componentDidMount() {
    const {
      location: { search = `` },
    } = this.props

    const { filters } = qs.parse(search.replace(`?`, ``))

    if (filters && filters.length) {
      this.setFilters(filters)
    }
  }

  componentDidUpdate() {
    const {
      location: { pathname, search },
    } = this.props
    const queryString = qs.stringify(this.state)

    if (search.replace(/^\?/, ``) !== queryString) {
      navigate(`${pathname}?${queryString}`, { replace: true })
    }
  }

  setFilters = filters => {
    this.setState({
      filters: [].concat(filters),
    })

    scrollToAnchor(this.showcase.current, () => {})()
  }

  render() {
    const { data } = this.props
    const { filters } = this.state

    return (
      <>
        <Helmet>
          <title>Showcase</title>
          <meta
            name="description"
            content="Gallery of sites using Gatsby across the web, find inspiration or inspect the code of popular projects."
          />
        </Helmet>
        <FeaturedSites
          setFilters={this.setFilters}
          featured={data.featured.nodes}
        />
        <div id="showcase" css={{ height: 0 }} ref={this.showcase} />
        <FilteredShowcase
          filters={filters}
          setFilters={this.setFilters}
          data={data}
        />
      </>
    )
  }
}

export default ShowcaseView
