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
      return `/showcase/?${queryString}`
    } else {
      return `/showcase/`
    }
  }

  render() {
    let { data, location } = this.props

    const isModal =
      location.state && location.state.isModal && window.innerWidth > 750

    const categories = data.sitesYaml.categories || []

    /*
     * This shouldn't ever happen due to filtering on hasScreenshot field
     * However, it appears to break Gatsby Build
     * so let's avoid a failure here
     */
    if (
      !data.sitesYaml.childScreenshot ||
      !data.sitesYaml.childScreenshot.screenshotFile
    ) {
      data.sitesYaml.childScreenshot = {
        screenshotFile: data.fallback,
      }
    }

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
            resize(width: 1200, height: 627, cropFocus: NORTH, toFormat: JPG) {
              src
              height
              width
            }
          }
        }
      }
      fields {
        slug
      }
    }

    fallback: file(relativePath: { eq: "screenshot-fallback.png" }) {
      childImageSharp {
        ...ScreenshotDetails
      }
    }
  }
`
