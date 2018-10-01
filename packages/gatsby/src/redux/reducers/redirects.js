const _ = require(`lodash`)

const createRedirectWithSlash = redirect => {
  const { fromPath } = redirect
  const isFile = pathPart => /\..+$/.test(pathPart)

  if (!isFile(fromPath) && fromPath !== `/`) {
    return {
      ...redirect,
      ...(isFile(fromPath) ? {} : {
        fromPath: `${fromPath}/`,
      }),
    }
  }

  return []
}

/*
 * Explicitly add redirect with and without trailing slash
 */
module.exports = (state = [], action) => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      const payload = [action.payload].concat(createRedirectWithSlash(action.payload))
      const filtered = payload.filter(redirect => !state.find(existing => _.isEqual(existing, redirect)))
      if (filtered.length > 0) {
        return [...state, ...filtered]
      }
      return state
    }

    default:
      return state
  }
}
