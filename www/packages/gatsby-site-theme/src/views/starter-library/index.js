import React, { Component } from "react"
import RRSM from "../../utils/reach-router-state-manager"
import queryString from "query-string"

import PageMetadata from "../../components/page-metadata"
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
      <>
        <PageMetadata
          title="Starter Library"
          description={`Gatsby Starters: ${filtersApplied}`}
          timeToRead={1}
        />
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
      </>
    )
  }
}

export default StarterLibraryPage
