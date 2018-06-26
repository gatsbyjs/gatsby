const getSlugId = pathname =>
  pathname
    .split(`/`)
    .slice(0, -1)
    .pop()

export default getSlugId
