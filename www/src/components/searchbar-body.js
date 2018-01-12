import React, { Component } from 'react'
import { InstantSearch, Hits, SearchBox, Stats, RefinementList } from 'react-instantsearch/dom'
import { connectHits } from 'react-instantsearch/connectors';
import distanceInWords from 'date-fns/distance_in_words'
import presets from "../utils/presets"
import Link from 'gatsby-link'
import DownloadsBlack from '../assets/down-arrow.svg'
import DownloadsWhite from '../assets/down-arrow-white.svg'
import {debounce} from 'lodash'

import typography, { rhythm } from "../utils/typography"

// This is for the urlSync
const updateAfter = 700
//

const Search = ({searchState}) => {
  const emptySearchBox = searchState.length > 0 ? false : true

  return (
    <div className="container">
      <div css={{
        display: `flex`,
        justifyContent: `center`,
      }}>

      <SearchBox
        translations={{placeholder: 'Search Gatsby Library'}}
      />

      </div>

      <div css={{
        display: `none`
      }}>
        <RefinementList attributeName="keywords"
          defaultRefinement={["gatsby-component", "gatsby-plugin"]}
        />
      </div>


     <div css={{
       opacity: emptySearchBox ? 0 : 1,
       height: rhythm(1.5),
       paddingTop: rhythm(.25),
       paddingBottom: rhythm(.25),
     }}>
       <Stats
         translations={{
           stats: function(n, ms){
             return `${n} results`
           }
         }}
       />
     </div>

     <div css={{
       borderTop: `2px solid #F5F3F7`,
       borderBottom: `2px solid #F5F3F7`,
       borderLeft: `2px solid #F5F3F7`,
     }}>

        <div css={{
          backgroundColor: `white`,
          height: `calc(100vh - 225px)`,
          border: `2 px solid red`,
          overflowY: `scroll`,
          WebkitOverflowScrolling: `touch`,
          "::-webkit-scrollbar": {
            width: `6px`,
            height: `6px`,
          },
          "::-webkit-scrollbar-thumb": {
            background: presets.lightPurple,
          },
          "::-webkit-scrollbar-track": {
            background: presets.brandLighter,
          },
        }}>
          <Hits hitComponent={Result} />
        </div>

    </div>

      <div>
        <h3 css={{
          fontSize: rhythm(.55),
          textAlign: `center`,
          margin: rhythm(.75),
        }}>Search by <a href={`https://www.algolia.com/`} style={{color: `#744C9E`, border: `none`, boxShadow: `none`}}>Algolia</a></h3>
      </div>

    </div>
  )
}

const Result = ({ hit, selected }) => {
  const select = selected() === hit.name
  const lastUpdated = `${distanceInWords(new Date(hit.modified), new Date())} ago`;
  return (
    <Link
      to={`/packages/${hit.name}`}
      style={{
      display: `block`,
      fontFamily: typography.options.bodyFontFamily.join(`,`),
      fontWeight: `400`,
      color: select? `white` : `black`,
      backgroundColor: select ? `#744C9E` : `white`,
      padding: rhythm(.5),
    }}>
      <div
        css={{
          fontFamily: typography.options.headerFontFamily.join(`,`),
          fontWeight: `bold`,
          display: `inline-block`,
          color: `white`,
          backgroundColor: `#696969`,
          padding: `3px 6px 3px 6px`,
        }}
        >
          {hit.name}
      </div>

      <span
        css={{
          paddingLeft: rhythm(1),
          fontSize: rhythm(.5),
        }}
        >
        {hit.humanDownloadsLast30Days}
      </span>

      <div css={{
        display: `flex`,
        justifyContent: `space-between`,
      }}>
        <div
          css={{
            fontFamily: typography.options.headerFontFamily.join(`,`),
            fontWeight: `bold`,
          }}
          >
            {hit.name}
          </div>

          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              fontSize: rhythm(.5),
            }}
            >
              {hit.humanDownloadsLast30Days}
              <img width="10"
                height="10"
                css={{
                  marginLeft: rhythm(.25),
                  marginBottom: 0,
                }}
                src={selected ? DownloadsWhite : DownloadsBlack}></img>
            </div>
      </div>


      <div css={{
        fontSize: rhythm(.6),
        paddingTop: rhythm(.25),
        lineHeight: rhythm(.75),
      }}>
        {hit.description}
      </div>

      {/* <div css={{
        fontSize: rhythm(.5),
        color: `#D3D3D3`,
      }}>
        {hit.keywords.join(", ")}
      </div> */}

      {/* <div
        css={{
          display: `flex`,
          paddingTop: rhythm(.25),
        }}
        >
        <img
          width="20"
          height="20"
          src={hit.lastPublisher.avatar}
         />
          <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5), textTransform: `uppercase`}}>{hit.lastPublisher.name}</span>
          <span css={{paddingLeft: rhythm(.25), fontSize: rhythm(.5)}}>{lastUpdated}</span>
      </div> */}
    </Link>
  )
}

const currentLocation = () => {
  return location.pathname.slice(10);
}


class SearchBar extends Component {
  constructor(props){
    super(props)
    this.state = {searchState: {query: this.urlToSearch(), page: 1} }
    this.updateHistory = debounce(this.updateHistory, updateAfter)
  }


  urlToSearch = () => {
    return (this.props.history.location.search).slice(2);
  }

  // Old way
  // onSearchStateChange = searchState => {
  //   clearTimeout(this.debouncedSetState);
  //   this.debouncedSetState = setTimeout(() => {
  //     this.props.history.replace(`/packages?=${searchState.query}`)
  //   }, updateAfter);]
  //   this.setState({ searchState })
  // }

  // New way
  updateHistory(value){
    this.props.history.replace(`/packages?=${value.query}`)
  }

  onSearchStateChange(searchState){
    this.updateHistory(searchState)
    this.setState({ searchState })
  }

  render(){
    return(
      <div>
        <InstantSearch
          apiKey="f54e21fa3a2a0160595bb058179bfb1e"
          appId="OFCNCOG2CU"
          indexName="npm-search"
          searchState={this.state.searchState}
          onSearchStateChange={this.onSearchStateChange.bind(this)}
          >
          <Search searchState={this.state.searchState.query} />
        </InstantSearch>
      </div>
    )
  }
}


export default SearchBar
