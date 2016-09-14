/* @flow weak */
import invariant from 'invariant'
import isString from 'lodash/isString'

function isDataURL (s) {
  // Regex from https://gist.github.com/bgrins/6194623#gistcomment-1671744
  // eslint-disable-next-line max-len
  const regex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9!\$&',\(\)\*\+,;=\-\._~:@\/\?%\s]*\s*$/i
  return !!s.match(regex)
}

// Function to add prefix to links.
const prefixLink = (_link) => {
  if (
      (typeof __PREFIX_LINKS__ !== 'undefined' && __PREFIX_LINKS__ !== null)
      && __PREFIX_LINKS__ && (__LINK_PREFIX__ !== null
  )) {
    const invariantMessage = `
    You're trying to build your site with links prefixed
    but you haven't set 'linkPrefix' in your gatsby-config.js.
    `
    invariant(isString(__LINK_PREFIX__), invariantMessage)

    // When url-loader is used with the limit option, some of images are encoded to
    // base64 data url, this check prevent such links from being prefixed.
    if (isDataURL(_link)) {
      return _link
    } else {
      return __LINK_PREFIX__ + _link
    }
  } else {
    return _link
  }
}

module.exports = {
  prefixLink,
}
