/* eslint-disable filenames/match-regex */
export const getContentSyncInfoFromUrl = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const { mid: manifestId, plgn: pluginName } = JSON.parse(
    atob(urlSearchParams.get(`csync`) || ``) || `{}`
  )

  if (!manifestId || !pluginName) {
    return null
  }

  return { manifestId, pluginName }
}
