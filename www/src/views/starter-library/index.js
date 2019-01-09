import React, { Component } from "react"
import { Helmet } from "react-helmet"
import Layout from "../../components/layout"
import Unbird from "../../components/unbird"
import RRSM from "../../utils/reach-router-state-manager"
import queryString from "query-string"

import FilteredStarters from "./filtered-starters"

class StarterLibraryPage extends Component {
  shouldComponentUpdate(nextProps) {
    // prevent double render https://gatsbyjs.slack.com/archives/CA1GW1HNU/p1529615449000350
    return JSON.stringify(this.props) !== JSON.stringify(nextProps)
  }
  render() {
    const { location } = this.props
    const urlState = queryString.parse(location.search)

    const filtersApplied =
      urlState.s !== undefined
        ? urlState.s // if theres a search term
        : urlState.d && !Array.isArray(urlState.d)
          ? urlState.d // if theres a single dependency
          : `Library` // if no search term or single dependency

    return (
      <Layout location={location}>
        <Helmet>
          <title>Starter Library</title>
          <meta
            name="description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta
            property="og:description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta
            name="twitter:description"
            content={`Gatsby Starters: ${filtersApplied}`}
          />
          <meta property="og:title" content={filtersApplied} />
          <meta property="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`1 min read`} />
        </Helmet>
        <RRSM
          {...this.props}
          location={location}
          render={({ setURLState, urlState }) => (
            <FilteredStarters
              {...this.props}
              setURLState={setURLState}
              urlState={urlState}
            />
          )}
          defaultSearchState={{ v: [`2`] }}
        />
        <Unbird
          dataSetId="5c113a828240aa564734d954"
          publicKey={process.env.UNBIRD_FEEDBACK_KEY_STARTERLIB}
          feedbackPrompt="Have feedback on the Starter Library?"
        />
      </Layout>
    )
  }
}

export default StarterLibraryPage
