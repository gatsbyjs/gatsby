/** @jsx jsx */
import { jsx } from "theme-ui"
import { MdClear } from "react-icons/md"

const ResetFilters = ({ onClick }) => (
  <div sx={{ pr: 6 }}>
    <button
      sx={{
        alignItems: `center`,
        bg: `purple.10`,
        border: 0,
        borderRadius: 1,
        color: `gatsby`,
        cursor: `pointer`,
        display: `flex`,
        fontFamily: `heading`,
        mt: 6,
        pl: 2,
        pr: 3,
        textAlign: `left`,
        "&:hover": {
          background: `gatsby`,
          color: `white`,
        },
      }}
      onClick={onClick}
    >
      <MdClear sx={{ mr: 1 }} /> Reset all Filters
    </button>
  </div>
)

export default ResetFilters
