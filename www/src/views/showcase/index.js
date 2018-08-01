import React, { Component } from "react"
import Helmet from "react-helmet"

import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"
import presets from "../../utils/presets"

class ShowcaseView extends Component {
  showcase = React.createRef()

  render = () => {
    const { location, data } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>Showcase</title>
        </Helmet>
        <FeaturedSites
          featured={data.featured.edges}
          showcase={this.showcase}
        />
        <div
          id="showcase"
          css={{
            position: `relative`,
            top: `calc(-${presets.headerHeight} + 1px)`,
            height: 1,
          }}
          ref={this.showcase}
        />
        <FilteredShowcase data={data} />
      </Layout>
    )
  }
}

export default ShowcaseView
