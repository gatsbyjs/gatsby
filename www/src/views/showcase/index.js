import React, { Component } from "react"
import Helmet from "react-helmet"
import { scroller } from "react-scroll"

import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"

class ShowcaseView extends Component {
  showcase = React.createRef()

  scrollTo = target => {
    scroller.scrollTo(target, {
      duration: 1,
      delay: 0,
      smooth: true,
      offset: -100,
    })
  }

  componentDidMount() {
    const { location } = this.props
    if (location.search && location.search.includes("?filters")) {
      this.scrollTo("showcase")
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      setTimeout(() => {
        const { location } = this.props
        if (location.search && location.search.includes("?filters")) {
          this.scrollTo("showcase")
        }
      }, 1)
    }
  }

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
        <div id="showcase" css={{ height: 0 }} ref={this.showcase} />
        <FilteredShowcase data={data} />
      </Layout>
    )
  }
}

export default ShowcaseView
