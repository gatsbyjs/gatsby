import React, { Component } from "react"
import { Helmet } from "react-helmet"

import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"

class ShowcaseView extends Component {
  showcase = React.createRef()

  constructor(props) {
    super(props)

    this.state = {
      filters: [],
    }
  }

  updateFilters = filters => {
    this.setState({
      filters: [].concat(filters),
    })
  }

  render() {
    const { location, data } = this.props
    const { filters } = this.state

    console.log(`implemented`, filters)

    return (
      <Layout location={location}>
        <Helmet>
          <title>Showcase</title>
        </Helmet>
        <FeaturedSites
          setFilters={this.updateFilters}
          featured={data.featured.edges}
          showcase={this.showcase}
        />
        <div id="showcase" css={{ height: 0 }} ref={this.showcase} />
        <FilteredShowcase
          filters={filters}
          setFilters={this.updateFilters}
          data={data}
        />
      </Layout>
    )
  }
}

export default ShowcaseView
