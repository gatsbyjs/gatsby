import React from "react"

import TagLink from "./tag-link"

const TagList = ({ data }) => {
  const {
    allMdx: { group: tags },
  } = data

  return (
    <>
      {tags.map(tag => (
        <TagLink key={tag.nodeValue} {...tag} />
      ))}
    </>
  )
}

export default TagList
