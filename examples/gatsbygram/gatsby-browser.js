const windowWidth = window.innerWidth

exports.shouldUpdateScroll = args => {
  // Scroll position only matters on mobile as on larger screens, we use a
  // modal.
  if (windowWidth < 750) {
    return true
  } else {
    return false
  }
}
