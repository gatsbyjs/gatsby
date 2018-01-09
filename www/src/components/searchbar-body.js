import React, { Component } from 'react'
import { InstantSearch, Hits, SearchBox, Stats } from 'react-instantsearch/dom'
import presets from "../utils/presets"
import Link from 'gatsby-link'

import typography from "../utils/typography"

function Search(){
  return (
    <div className="container">
      <div css={{
        display: `flex`,
        justifyContent: `center`,
      }}>
      <SearchBox
        translations={{placeholder: 'Search Gatsby Library by keyword'}}
      />
      </div>
     <div css={{
       paddingBottom: `10px`,
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
        backgroundColor: `white`,
        height: `calc(100vh - 250px)`,
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
  )
}

function Result({ hit }){
  return (
    <div css={{
      borderBottom: `1px solid grey`,
    }}>
      <div css={{
        padding: `10px`,
      }}>
        <Link to={hit.node.fields.slug}
          style={{
            color: `white`,
            border: `0`,
            boxShadow: `0 0 0 0`,
            backgroundColor: `#696969`,
            padding: `3px 6px 3px 6px`,
            fontFamily: typography.options.headerFontFamily.join(`,`),
          }}
          >
            {hit.node.fields.title}
        </Link>
        <div css={{
          fontFamily: typography.options.bodyFontFamily.join(`,`),
          fontSize: `${13 / 16 * 100}%`,
          lineHeight: `1.1`,
          paddingTop: `7px`,
        }}>
          {hit.node.excerpt.split(hit.node.fields.title)[1]}
        </div>
      </div>
    </div>
  )
}


class SearchBar extends Component {
  render(){
    return(
      <div>
          <div>
            <InstantSearch
              apiKey="46abe2288ee056d552a0a0e938be4938"
              appId="I44D3HTHDS"
              indexName="plugins"
              >
              <Search />
            </InstantSearch>
          </div>
      </div>
    )
  }
}

export default SearchBar
