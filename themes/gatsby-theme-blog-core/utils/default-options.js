module.exports = themeOptions => {
  const basePath = themeOptions.basePath || `/`
  const contentPath = themeOptions.contentPath || `content/posts`
  const assetPath = themeOptions.assetPath || `content/assets`

  return {
    basePath,
    contentPath,
    assetPath,
  }
}
