import React from "react"
import { push } from "gatsby"

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

  next = () => {
    const { location } = this.props

    const nextSite = this.getNext()

    push({
      pathname: nextSite.fields.slug,
      state: {
        isModal: location.state.isModal,
      },
    })
  }

  getPrevious(allSitesYaml) {
    const currentIndex = this.findCurrentIndex(allSitesYaml)
    let index = currentIndex - 1
    if (index < 0) index = allSitesYaml.edges.length - 1
    return allSitesYaml.edges[index].node
  }

  previous = () => {
    const { location } = this.props

    const previousSite = this.getPrevious()
    push({
      pathname: previousSite.fields.slug,
      state: {
        isModal: location.state.isModal,
      },
    })
  }

  UNSAFE_componentWillMount() {}

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
  query TemplateShowcasePage($slug: String!) {
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
            sizes(maxWidth: 700) {
              ...GatsbyImageSharpSizes
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
