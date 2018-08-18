export default function(resources, path) {
  return new Promise(resolve => {
    const url = new URL(window.location.origin + path)

    // Check the page isn't already loaded directly.
    if (!url.search.match(/(\?|&)no-cache=1$/)) {
      // Append the appropriate query to the URL.
      if (url.search) {
        url.search += `&no-cache=1`
      } else {
        url.search = `?no-cache=1`
      }

      // Always navigate directly if a custom 404 page doesn't exist.
      if (!resources) {
        window.location = url
      } else {
        // Now test if the page is available directly
        fetch(url.href)
          .then(response => {
            if (response.status !== 404) {
              // Redirect there if there isn't a 404. If a different HTTP
              // error occurs, the appropriate error message will be
              // displayed after loading the page directly.
              window.location.replace(url)
            } else {
              // If a 404 occurs, show the custom 404 page.
              resolve()
            }
          })
          .catch(() => {
            // If an error occurs (usually when offline), navigate to the
            // page anyway to show the browser's proper offline error page
            window.location = url
          })
      }
    }
  })
}
