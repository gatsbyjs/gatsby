import { config } from 'config'
import invariant from 'invariant'
import isString from 'lodash/isString'

// Function to add prefix to links.
const prefixLink = (_link) => {
  if (
      (typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null)
      && __PREFIX_LINKS__ && (config.linkPrefix !== null
  )) {
    const invariantMessage = `
    You're trying to build your site with links prefixed
    but you haven't set 'linkPrefix' in your config.toml.
    `
    invariant(isString(config.linkPrefix), invariantMessage)

    return config.linkPrefix + _link
  } else {
    return _link
  }
}

module.exports = {
  prefixLink,
}
