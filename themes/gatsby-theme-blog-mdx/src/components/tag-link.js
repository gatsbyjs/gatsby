import React from "react"
import { Link } from "gatsby"

const TagLink = ({ fieldValue, totalCount }) => {
  const path = `/tags/${fieldValue}`

  return (
    <Link to={path}>
      <h3>
        {fieldValue} ({totalCount})
      </h3>
    </Link>
  )
}

export default TagLink
