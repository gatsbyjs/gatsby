import { config } from 'config'

// Function to add prefix to links.
const link = (_link) => {
  if (
      (typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null)
      && __PREFIX_LINKS__ && (config.linkPrefix !== null
  )) {
    return config.linkPrefix + _link
  } else {
    return _link
  }
}

module.exports = {
  link,
}
