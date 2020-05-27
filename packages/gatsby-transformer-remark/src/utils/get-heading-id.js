export const getHeadingID = heading => {
  const data = heading.data
  if (data) {
    if (data.id) return data.id
    if (data.htmlAttributes && data.htmlAttributes.id) {
      return data.htmlAttributes.id
    }

    if (data.hProperties && data.hProperties.id) {
      return data.hProperties.id
    }
  }

  return null
}
