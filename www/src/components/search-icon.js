/** @jsx jsx */
import { jsx } from "theme-ui"
import PropTypes from "prop-types"
import MdSearch from "react-icons/lib/md/search"

const SearchIcon = ({ focused }) => (
  <MdSearch
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
        focused ? t.colors.themedInput.iconFocus : t.colors.themedInput.icon,
    }}
  />
)

SearchIcon.propTypes = {
  overrideCSS: PropTypes.object,
}

export default SearchIcon
