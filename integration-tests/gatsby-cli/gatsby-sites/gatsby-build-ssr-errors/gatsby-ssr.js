// This will cause an error during SSR because window is not defined
exports.onPreRenderHTML = () => {
  window.location.pathname
}
