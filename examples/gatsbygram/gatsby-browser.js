exports.shouldUpdateScroll = args => {
  const windowWidth = window.innerWidth
  // Scroll position only matters on mobile as on larger screens, we use a
  // modal.
  return windowWidth < 750
}

exports.onInitialClientRender = () => {
  window.___GATSBYGRAM_INITIAL_RENDER_COMPLETE = true
}
