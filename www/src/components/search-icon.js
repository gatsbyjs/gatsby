import React from "react"
import PropTypes from "prop-types"

const SearchIcon = ({ overrideCSS }) => (
  <svg
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    css={{ ...overrideCSS }}
  >
    {/* Based on the 'search' icon in https://github.com/ionic-team/ionicons */}
    <g>
      <path d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z" />
    </g>
  </svg>
)

SearchIcon.propTypes = {
  overrideCSS: PropTypes.object,
}

export default SearchIcon
