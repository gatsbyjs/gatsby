import React, { Component } from "react"
import Helmet from "react-helmet"

import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"

class ShowcaseView extends Component {
  showcase = React.createRef()

  scrollToElement = (element, offset = 100) => {
    setTimeout(() => {
      const elementTop = document.querySelector(element).getClientRects()[0].top
      window.scroll({
        top: elementTop - offset,
        left: 0,
      })
    }, 50)
  }

  componentDidMount() {
    const { location } = this.props
    if (location.search && location.search.includes(`?filters`)) {
      this.scrollToElement(`#showcase`)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const { location } = this.props
      if (location.search && location.search.includes(`?filters`)) {
        this.scrollToElement(`#showcase`)
      }
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
