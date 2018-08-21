import React from 'react'
import { Link } from 'gatsby'
import PaginationLink from './PaginationLink'

const Pagination = ({ context }) => {
  const { numPages, currentPage } = context
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPageNum = currentPage - 1 === 1 ? `` : (currentPage - 1).toString()
  const nextPageNum = (currentPage + 1).toString()
  const prevPageLink = isFirst ? null : `/blog/${prevPageNum}`
  const nextPageLink = isLast ? null : `/blog/${nextPageNum}`
  return (
    <div>
      <PaginationLink to={prevPageLink} rel="prev">← Previous Page</PaginationLink>
      {Array.from({ length: numPages }, (_, i) => (
        <Link to={`blog/${i === 0 ? `` : i + 1}`} key={`pagination-number${i + 1}`}>
          <span>{i + 1}</span>
        </Link>
      ))}
      <PaginationLink to={nextPageLink} rel="next">Next Page →</PaginationLink>
    </div>
  )
}

export default Pagination