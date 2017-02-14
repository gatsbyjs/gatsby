const catchLinks = require('catch-links')
const browserHistory = require('react-router/lib/browserHistory')

catchLinks(window, (href) => {
  console.log(href)
  browserHistory.push(href)
})
