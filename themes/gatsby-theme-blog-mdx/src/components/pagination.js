import React from "react"
import { Link } from "gatsby"

const Pagination = ({ isFirst, isLast, nextPage, prevPage }) => (
  <>
    {isFirst ? null : <Link to={prevPage}>Previous</Link>}
    {isLast ? null : <Link to={nextPage}>Next</Link>}
  </>
)

export default Pagination
