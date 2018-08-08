exports.onClientEntry = () => {
  ;(function() {
    const path = `https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css`
    const link = document.createElement(`link`)
    link.setAttribute(`rel`, `stylesheet`)
    link.setAttribute(`type`, `text/css`)
    link.setAttribute(`href`, path)
    document.head.appendChild(link)
  })()
}
