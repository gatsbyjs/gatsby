/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "../localized-link"

const PaginationLink = ({ to, children, ...props }) => {
  if (to) {
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    )
  }
  return <span sx={{ color: `textMuted` }}>{children}</span>
}

export default PaginationLink
