const _ = require(`lodash`)

const redirects = new Map()

function exists(newRedirect) {
  if (!redirects.has(newRedirect.fromPath)) {
    return false
  }

  return redirects
    .get(newRedirect.fromPath)
    .some(redirect => _.isEqual(redirect, newRedirect))
}

function add(redirect) {
  let samePathRedirects = redirects.get(redirect.fromPath)

  if (!samePathRedirects) {
    samePathRedirects = []
    redirects.set(redirect.fromPath, samePathRedirects)
  }

  samePathRedirects.push(redirect)
}

module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      const redirect = action.payload

      // Add redirect only if it wasn't yet added to prevent duplicates
      if (!exists(redirect)) {
        add(redirect)

        state.push(redirect)
      }

      return state
    }

    default:
      return state
  }
}
