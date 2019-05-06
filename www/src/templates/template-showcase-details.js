import React from "react"
import { navigate, graphql } from "gatsby"
import qs from "qs"

import ShowcaseDetails from "../components/showcase-details"

class ShowcaseTemplate extends React.Component {
  findCurrentIndex(allSitesYaml) {
    for (let i = 0; i < allSitesYaml.edges.length; i++) {
      const site = allSitesYaml.edges[i].node
      if (site.fields.slug === this.props.location.pathname) {
        return i
      }
    }

    return 0
  }

  getNext(allSitesYaml) {
    const currentIndex = this.findCurrentIndex(allSitesYaml)
    return allSitesYaml.edges[(currentIndex + 1) % allSitesYaml.edges.length]
      .node
  }

  next = allSitesYaml => {
    const { location } = this.props

    const nextSite = this.getNext(allSitesYaml)

    navigate(nextSite.fields.slug, {
      state: {
        isModal: location.state.isModal,
        filters: location.state.filters,
      },
    })
  }

  getPrevious(allSitesYaml) {
    const currentIndex = this.findCurrentIndex(allSitesYaml)
    let index = currentIndex - 1
    if (index < 0) index = allSitesYaml.edges.length - 1
    return allSitesYaml.edges[index].node
  }

  previous = allSitesYaml => {
    const { location } = this.props

    const previousSite = this.getPrevious(allSitesYaml)
    navigate(previousSite.fields.slug, {
      state: {
        isModal: location.state.isModal,
        filters: location.state.filters,
      },
    })
  }

  /**
   * @returns {string} - the URI that should be navigated to when the showcase details modal is closed
   */
  getExitLocation() {
    if (
      this.props.location.state &&
      this.props.location.state.filters &&
      Object.keys(this.props.location.state.filters).length
    ) {
      const queryString = qs.stringify({
        filters: this.props.location.state.filters,
      })
      return `/showcase?${queryString}`
    } else {
      return `/showcase`
    }
  }

  render() {
    const { data } = this.props

    const isModal =
      this.props.location.state && this.props.location.state.isModal

    const categories = data.sitesYaml.categories || []

    return (
      <ShowcaseDetails
        isModal={isModal}
        data={data}
        categories={categories}
        parent={this}
      />
    )
  }
}

export default ShowcaseTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    sitesYaml(fields: { slug: { eq: $slug } }) {
      id
      title
      main_url
      featured
      categories
      built_by
      built_by_url
      source_url
      description
      childScreenshot {
        screenshotFile {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_noBase64
            }
            resize(
              width: 1500
              height: 1500
              cropFocus: CENTER
              toFormat: JPG
            ) {
              src
            }
          }
        }
      }
      fields {
        slug
      }
    }
  }
`
