import React, { Component } from "react"
import Helmet from "react-helmet"

import FeaturedSites from "./featured-sites"
import FilteredShowcase from "./filtered-showcase"
import Layout from "../../components/layout"

class ShowcaseView extends Component {
  showcase = React.createRef()

  handleScroll = ({ element, offsetTop = 0 }) => {
    if (
      this.props.location.search &&
      this.props.location.search.includes(`?filters`)
    ) {
      if (element.offsetTop !== 0) {
        setTimeout(() => {
          window.scroll({
            top: element.offsetTop - offsetTop,
            left: 0,
            behavior: `smooth`,
          })
        }, 50)
      }
    }
  }

  componentDidMount() {
    this.handleScroll({
      element: this.showcase.current,
      offsetTop: 100,
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.handleScroll({
        element: this.showcase.current,
        offsetTop: 100,
      })
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
