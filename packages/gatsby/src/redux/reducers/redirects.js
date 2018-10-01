const _ = require(`lodash`)

const createRedirectWithSlash = redirect => {
  const { fromPath, toPath } = redirect
  const isFile = pathPart => /\..+$/.test(pathPart)
  const addSlashRedirect = (...parts) => parts.map(part => part.split(`/`).pop()).some(part => !isFile(part))

  if (addSlashRedirect(fromPath, toPath)) {
    return {
      ...redirect,
      ...(isFile(fromPath) ? {} : {
        fromPath: `${fromPath}/`,
      }),
      ...(isFile(toPath) ? {} : {
        toPath: `${toPath}/`,
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
