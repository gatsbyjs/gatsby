const reRemoveSlash = /(^\/+|\/+$)/g
const segmentize = uri =>
  uri
    .replace(reRemoveSlash, ``)
    .split(`/`)
    .filter(x => !!x)

const addPathFactory = root => (path, value) => {
  const segments = segmentize(path)

  let reference = root
  for (let segment of segments) {
    if (!reference.c) {
      reference.c = {}
    }

    if (!reference.c[segment]) {
      reference.c[segment] = {}
    }

    reference = reference.c[segment]
  }

  reference.v = value
}

const createPathsFromArray = pages => {
  const root = {}
  const addPath = addPathFactory(root)
  for (let page of pages) {
    if (page.path) {
      addPath(page.path, page)
    }

    if (page.matchPath) {
      addPath(page.matchPath, page)
    }
  }
  return root
}

const createArrayFromAllPaths = root => {
  const paths = []

  const traverse = parent => {
    if (parent.v) {
      paths.push(parent.v)
    }

    if (parent.c) {
      Object.keys(parent.c).forEach(key => traverse(parent.c[key]))
    }
  }

  traverse(root)

  return paths
}

const matchPathFactory = root => path => {
  const segments = segmentize(path)

  let reference = root
  let splat
  for (let segment of segments) {
    const children = reference.c || {}

    // If the current segment has a catch-all,
    // set the splat. If not, keep using the old
    // or undefined one
    splat = children[`*`] || splat

    // Get the next reference based on the path segment
    const nextReference = children[segment]

    // If a component for the next segment doesn't exist
    // fall back to the splat or return undefined
    if (!nextReference) {
      if (splat) {
        reference = splat
        break
      } else {
        return undefined
      }
    }

    reference = nextReference
  }
  return reference.v
}

module.exports = {
  createArrayFromAllPaths,
  matchPathFactory,
  createPathsFromArray,
  addPathFactory,
}
