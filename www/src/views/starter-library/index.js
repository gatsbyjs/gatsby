import React, { Component } from "react"
import Helmet from "react-helmet"
import Layout from "../../components/layout"
import RRSM from "../../utils/reach-router-state-manager"

import FilteredStarters from "./filtered-starters"

class StarterLibraryPage extends Component {
  shouldComponentUpdate(nextProps) {
    // prevent double render https://gatsbyjs.slack.com/archives/CA1GW1HNU/p1529615449000350
    return JSON.stringify(this.props) !== JSON.stringify(nextProps)
  }
  render() {
    const { location, urlState } = this.props
    const filtersApplied =
      urlState.s !== ``
        ? urlState.s // if theres a search term
        : urlState.d && !Array.isArray(urlState.d)
          ? urlState.d // if theres a single dependency
          : `Showcase` // if no search term or single dependency
    return (
      <Layout location={location}>
        <Helmet>
          <title>Starter Library</title>
          <meta
            name="description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta
            name="og:description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta
            name="twitter:description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta name="og:title" content={filtersApplied} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`1 min read`} />
        </Helmet>
        <FilteredStarters {...this.props} />
      </Layout>
    )
  }
}

export default RRSM({ s: ``, c: [], d: [], sort: `recent` })(StarterLibraryPage)
