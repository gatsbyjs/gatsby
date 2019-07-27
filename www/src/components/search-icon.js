/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import PropTypes from "prop-types"
import MdSearch from "react-icons/lib/md/search"

const SearchIcon = ({ focussed }) => (
  <MdSearch
    fill={false}
    focusable="false"
    aria-hidden="true"
    sx={{
      width: t => t.space[5],
      height: t => t.space[5],
      position: `absolute`,
      left: `0.5rem`,
      top: `50%`,
      pointerEvents: `none`,
      transform: `translateY(-50%)`,
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
