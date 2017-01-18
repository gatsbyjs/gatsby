exports.clientEntry = (args, pluginOptions) => {
  // This code is only so scrolling to header hashes works in development.
  // For production, the equivalent code is in gatsby-ssr.js.
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV !== `production`) {
    const hash = window.location.hash.replace(`#`, ``)
    if (hash !== ``) {
      const element = document.getElementById(hash)
      if (element) {
        const offset = element.offsetTop
        window.scrollTo(0, offset - pluginOptions.offsetY)
      }
    }
  }
}
