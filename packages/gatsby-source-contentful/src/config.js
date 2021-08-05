const path = require(`path`)

// @todo execute name deprication on next major
if (process.env.GATSBY_REMOTE_CACHE) {
  console.warn(
    `Note: \`GATSBY_REMOTE_CACHE\` will be removed soon because it has been renamed to \`GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE\``
  )
}

if (process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE) {
  console.warn(
    `Please be aware that the \`GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE\` env flag is not officially supported and could be removed at any time`
  )
}

// By default store the images in `.cache` but allow the user to override
// and store the image cache away from the gatsby cache. After all, the gatsby
// cache is more likely to go stale than the images (which never go stale)
const getCacheFolder = ({ store }) => {
  const program = store.getState().program
  const userCacheFolder =
    process.env.GATSBY_CONTENTFUL_EXPERIMENTAL_REMOTE_CACHE ||
    process.env.GATSBY_REMOTE_CACHE
  const REMOTE_CACHE_FOLDER =
    userCacheFolder || path.join(program.directory, `.cache/remote_cache`)
  return path.join(REMOTE_CACHE_FOLDER, `contentful-images`)
}

exports.getCacheFolder = getCacheFolder
