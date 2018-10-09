export function getRedirectUrl(path) {
  const url = new URL(path, window.location.origin)

  // This should never happen, but check just in case - otherwise, there would
  // be an infinite redirect loop
  if (url.search.match(/\?(.*&)?no-cache=1(&|$)/)) {
    console.error(
      `Found no-cache=1 while attempting to load a page directly; ` +
        `this is likely due to a bug in Gatsby, or a misconfiguration in your project.`
    )
    return false
  }

  // Append the appropriate query to the URL.
  if (url.search) {
    url.search += `&no-cache=1`
  } else {
    url.search = `?no-cache=1`
  }

  return url
}

/**
 * When other parts of the code can't find resources for a page, they load the 404 page's
 * resources (if it exists) and then pass them here. This module then does the following:
 * 1. Checks if 404 pages resources exist. If not, just navigate directly to the desired URL
 * to show whatever server 404 page exists.
 * 2. Try fetching the desired page to see if it exists on the server but we
 * were just prevented from seeing it due to loading the site from a SW. If this is the case,
 * trigger a hard reload to grab that page from the server.
 * 3. If the page doesn't exist, show the normal 404 page component.
 * 4. If the fetch failed (generally meaning we're offline), then navigate anyways to show
 * either the browser's offline page or whatever the server error is.
 */
export default function(resources, path, replaceOnSuccess = false) {
  return new Promise((resolve, reject) => {
    const url = getRedirectUrl(path)
    if (!url) return reject(url)

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
            if (replaceOnSuccess) {
              window.location.replace(url)
            } else {
              window.location = url
            }
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
  })
}
