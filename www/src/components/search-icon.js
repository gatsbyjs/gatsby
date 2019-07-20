/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"
import MdSearch from "react-icons/lib/md/search"

const SearchIcon = ({ overrideCSS, focussed }) => (
  <MdSearch
    fill={false}
    focusable="false"
    aria-hidden="true"
    sx={{
      width: t => t.space[5],
      height: t => t.space[5],
      ...overrideCSS,
      fill: t =>
        focussed
          ? t.colors.navigation.searchIconFocus
          : t.colors.navigation.searchIcon,
    }}
  />
)

SearchIcon.propTypes = {
  overrideCSS: PropTypes.object,
}

export default SearchIcon
