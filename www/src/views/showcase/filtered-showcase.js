import React, { Component } from "react"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import Fuse from "fuse.js"

import styles from "../shared/styles"
import ShowcaseList from "./showcase-list"
import Filters from "./filters"
import SearchIcon from "../../components/search-icon"
import Button from "../../components/button"
import { colors } from "../../utils/presets"
import URLQuery from "../../components/url-query"
import {
  ContentHeader,
  ContentTitle,
  ContentContainer,
} from "../shared/sidebar"

const filterByCategories = (list, categories) => {
  const items = list.reduce((aggregated, edge) => {
    if (edge.node.categories) {
      if (edge.node.categories.filter(c => categories.includes(c)).length) {
        aggregated.push(edge)
      }

      return aggregated
    }

    return aggregated
  }, [])

  return items
}

class FilteredShowcase extends Component {
  state = {
    search: ``,
    sitesToShow: 12,
  }

  constructor(props) {
    super(props)

    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        `node.title`,
        `node.categories`,
        `node.built_by`,
        `node.description`,
      ],
    }

    this.fuse = new Fuse(props.data.allSitesYaml.edges, options)
  }

  render() {
    const { data } = this.props

    return (
      <URLQuery>
        {({ filters = [] }, updateQuery) => {
          let items = data.allSitesYaml.edges

          if (this.state.search.length > 0) {
            items = this.fuse.search(this.state.search)
          }

          if (filters && filters.length > 0) {
            items = filterByCategories(items, filters)
          }

          // create map of categories with totals
          const aggregatedCategories = data.allSitesYaml.edges.reduce(
            (categories, edge) => {
              if (edge.node.categories) {
                edge.node.categories.forEach(category => {
                  // if we already have the category recorded, increase count
                  if (categories[category]) {
                    categories[category] = categories[category] + 1
                  } else {
                    // record first encounter of category
                    categories[category] = 1
                  }
                })
              }

              return { ...categories }
            },
            {}
          )

          // get sorted set of categories to generate list with
          const categoryKeys = Object.keys(aggregatedCategories).sort(
            (a, b) => {
              if (a < b) return -1
              if (a > b) return 1
              return 0
            }
          )

          return (
            <section className="showcase" css={{ display: `flex` }}>
              <Filters
                updateQuery={updateQuery}
                filters={filters}
                categoryKeys={categoryKeys}
                aggregatedCategories={aggregatedCategories}
              />
              <ContentContainer>
                <ContentHeader>
                  <ContentTitle
                    search={this.state.search}
                    filters={filters}
                    label="Site"
                    items={items}
                    edges={data.allSitesYaml.edges}
                  />
                  <div css={{ marginLeft: `auto` }}>
                    <label css={{ position: `relative` }}>
                      <input
                        css={{ ...styles.searchInput }}
                        type="search"
                        value={this.state.search}
                        onChange={e =>
                          this.setState({ search: e.target.value })
                        }
                        placeholder="Search sites"
                        aria-label="Search sites"
                      />
                      <SearchIcon
                        overrideCSS={{
                          fill: colors.lilac,
                          position: `absolute`,
                          left: `5px`,
                          top: `50%`,
                          width: `16px`,
                          height: `16px`,
                          pointerEvents: `none`,
                          transform: `translateY(-50%)`,
                        }}
                      />
                    </label>
                  </div>
                </ContentHeader>

                <ShowcaseList items={items} count={this.state.sitesToShow} />

                {this.state.sitesToShow < items.length && (
                  <Button
                    tag="button"
                    overrideCSS={styles.loadMoreButton}
                    onClick={() => {
                      this.setState({
                        sitesToShow: this.state.sitesToShow + 15,
                      })
                    }}
                    icon={<MdArrowDownward />}
                  >
                    Load More
                  </Button>
                )}
              </ContentContainer>
            </section>
          )
        }}
      </URLQuery>
    )
  }
}

export default FilteredShowcase
