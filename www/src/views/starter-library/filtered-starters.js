/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import SearchIcon from "../../components/search-icon"
import MdArrowDownward from "react-icons/lib/md/arrow-downward"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import MdSort from "react-icons/lib/md/sort"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { loadMoreButton } from "../shared/styles"
import LHSFilter from "./lhs-filter"
import StarterList from "./starter-list"
import Button from "../../components/button"
import {
  SidebarHeader,
  SidebarBody,
  SidebarContainer,
  ContentHeader,
  ContentTitle,
  ContentContainer,
} from "../shared/sidebar"
import FooterLinks from "../../components/shared/footer-links"
import ResetFilters from "../shared/reset-filters"
import DebounceInput from "../../components/debounce-input"
import { themedInput } from "../../utils/styles"

export default class FilteredStarterLibrary extends Component {
  state = {
    sitesToShow: 12,
  }
  setFiltersCategory = filtersCategory => {
    this.props.setURLState({ c: Array.from(filtersCategory) })
  }
  setFiltersDependency = filtersDependency =>
    this.props.setURLState({ d: Array.from(filtersDependency) })
  setFiltersVersion = filtersVersion =>
    this.props.setURLState({ v: Array.from(filtersVersion) })
  toggleSort = () =>
    this.props.setURLState({
      sort: this.props.urlState.sort === `recent` ? `stars` : `recent`,
    })
  resetFilters = () => this.props.setURLState({ c: [], d: [], v: [], s: `` })
  showMoreSites = starters => {
    let showAll =
      this.state.sitesToShow + 15 > starters.length ? starters.length : false
    this.setState({
      sitesToShow: showAll ? showAll : this.state.sitesToShow + 15,
    })
  }
  onChangeUrlWithText = value => this.props.setURLState({ s: value })

  render() {
    const { data, urlState } = this.props
    const {
      setFiltersCategory,
      setFiltersDependency,
      setFiltersVersion,
      resetFilters,
      toggleSort,
    } = this
    const filtersCategory = new Set(
      Array.isArray(urlState.c) ? urlState.c : [urlState.c]
    )
    const filtersDependency = new Set(
      Array.isArray(urlState.d) ? urlState.d : [urlState.d]
    )
    const filtersVersion = new Set(
      Array.isArray(urlState.v) ? urlState.v : [urlState.v]
    )
    // https://stackoverflow.com/a/32001444/1106414
    const filters = new Set(
      [].concat(
        ...[filtersCategory, filtersDependency, filtersVersion].map(set =>
          Array.from(set)
        )
      )
    )

    // stopgap for missing gh data (#8763)
    let starters = data.allStartersYaml.edges.filter(
      ({ node: starter }) => starter.fields && starter.fields.starterShowcase
    )

    if (urlState.s.length > 0) {
      starters = starters.filter(starter =>
        JSON.stringify(starter.node)
          .toLowerCase()
          .includes(urlState.s.toLowerCase())
      )
    }

    if (filtersCategory.size > 0) {
      starters = filterByCategories(starters, filtersCategory)
    }
    if (filtersDependency.size > 0) {
      starters = filterByDependencies(starters, filtersDependency)
    }

    if (filtersVersion.size > 0) {
      starters = filterByVersions(starters, filtersVersion)
    }

    return (
      <section className="showcase" css={{ display: `flex` }}>
        <SidebarContainer css={{ overflowY: `auto` }}>
          <SidebarHeader />
          <SidebarBody>
            <div sx={{ height: t => t.space[10] }}>
              {(filters.size > 0 || urlState.s.length > 0) && ( // search is a filter too https://gatsbyjs.slack.com/archives/CB4V648ET/p1529224551000008
                <ResetFilters onClick={resetFilters} />
              )}
            </div>
            <LHSFilter
              fixed={150}
              heading="Gatsby Version"
              data={Array.from(
                count(
                  starters.map(
                    ({ node }) =>
                      node.fields &&
                      node.fields.starterShowcase.gatsbyMajorVersion.map(
                        str => str[1]
                      )
                  )
                )
              )}
              filters={filtersVersion}
              setFilters={setFiltersVersion}
            />
            <LHSFilter
              heading="Categories"
              data={Array.from(
                count(starters.map(({ node: starter }) => starter.tags))
              )}
              filters={filtersCategory}
              setFilters={setFiltersCategory}
              sortRecent={urlState.sort === `recent`}
            />
            <LHSFilter
              heading="Gatsby Dependencies"
              data={Array.from(
                count(
                  starters.map(
                    ({ node: starter }) =>
                      starter.fields &&
                      starter.fields.starterShowcase.gatsbyDependencies.map(
                        str => str[0]
                      )
                  )
                )
              )}
              filters={filtersDependency}
              setFilters={setFiltersDependency}
              sortRecent={urlState.sort === `recent`}
            />
          </SidebarBody>
        </SidebarContainer>
        <ContentContainer>
          <ContentHeader
            cssOverrides={{
              height: `6rem`,
              pt: 6,
              [mediaQueries.sm]: {
                height: `headerHeight`,
                pt: 0,
              },
            }}
          >
            <ContentTitle
              search={urlState.s}
              filters={filters}
              label="Gatsby Starter"
              items={starters}
              edges={starters}
              what="size"
            />
            <div
              sx={{
                display: `flex`,
                justifyContent: `space-between`,
                mb: 2,
                width: `100%`,
                [mediaQueries.sm]: {
                  justifyContent: `flex-end`,
                  mb: 0,
                  width: `50%`,
                },
              }}
            >
              {/* TODO add sorting. */}
              <label
                sx={{
                  display: `none`,
                  [mediaQueries.lg]: {
                    border: 0,
                    borderRadius: 2,
                    color: `gatsby`,
                    fontFamily: `heading`,
                    py: 1,
                    pr: 1,
                    width: `10rem`,
                  },
                }}
                onClick={toggleSort}
              >
                <MdSort sx={{ mr: 2 }} />
                {urlState.sort === `recent` ? `Most recent` : `Most stars`}
              </label>
              <label css={{ position: `relative` }}>
                <DebounceInput
                  sx={{
                    ...themedInput,
                    pl: 7,
                  }}
                  value={urlState.s}
                  onChange={this.onChangeUrlWithText}
                  placeholder="Search starters"
                  aria-label="Search starters"
                />
                <SearchIcon />
              </label>
              <Button
                to="https://gatsbyjs.org/contributing/submit-to-starter-library/"
                tag="href"
                target="_blank"
                rel="noopener noreferrer"
                variant="small"
                icon={<ArrowForwardIcon />}
                overrideCSS={{ ml: 3 }}
              >
                Submit a Starter
              </Button>
            </div>
          </ContentHeader>
          <StarterList
            urlState={urlState}
            sortRecent={urlState.sort === `recent`}
            starters={starters}
            count={this.state.sitesToShow}
          />
          {this.state.sitesToShow < starters.length && (
            <Button
              variant="large"
              tag="button"
              overrideCSS={loadMoreButton}
              onClick={() => this.showMoreSites(starters)}
              icon={<MdArrowDownward />}
            >
              Load More
            </Button>
          )}
          <FooterLinks />
        </ContentContainer>
      </section>
    )
  }
}

// utility functions

function count(arrays) {
  let counts = new Map()

  for (let categories of arrays) {
    if (!categories) continue

    for (let category of categories) {
      if (!counts.has(category)) {
        counts.set(category, 0)
      }

      counts.set(category, counts.get(category) + 1)
    }
  }

  return counts
}

function filterByCategories(list, categories) {
  let starters = list
  starters = starters.filter(({ node: starter }) =>
    isSuperset(starter.tags, categories)
  )
  return starters
}
function filterByDependencies(list, categories) {
  let starters = list

  starters = starters.filter(
    ({ node: starter }) =>
      starter.fields &&
      isSuperset(
        starter.fields.starterShowcase.gatsbyDependencies.map(c => c[0]),
        categories
      )
  )

  return starters
}

function filterByVersions(list, versions) {
  let starters = list
  starters = starters.filter(
    ({ node }) =>
      node.fields &&
      isSuperset(
        node.fields.starterShowcase.gatsbyMajorVersion.map(c => c[1]),
        versions
      )
  )
  return starters
}

function isSuperset(set, subset) {
  for (var elem of subset) {
    if (!set.includes(elem)) {
      return false
    }
  }
  return true
}
