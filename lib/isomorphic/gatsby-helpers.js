import { config } from 'config'
import invariant from 'invariant'

// Function to add prefix to links.
const prefixLink = (_link) => {
  if (
      (typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null)
      && __PREFIX_LINKS__ && (config.linkPrefix !== null
  )) {
    invariant(config.linkPrefix,
              ```
              You're trying to build your site with links prefixed
              but you haven't set 'linkPrefix' in your config.toml.
              ```
    )
    return config.linkPrefix + _link
  } else {
    return _link
  }
}

module.exports = {
  prefixLink,
}
