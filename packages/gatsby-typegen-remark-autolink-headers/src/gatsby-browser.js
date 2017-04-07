const scrollToHash = offsetY => {
  // Make sure React has had a change to flush to DOM first.
  setTimeout(
    () => {
      const hash = window.location.hash.replace(`#`, ``);
      if (hash !== ``) {
        const element = document.getElementById(hash);
        if (element) {
          const offset = element.offsetTop;
          window.scrollTo(0, offset - offsetY);
        }
      }
    },
    10
  );
};

exports.clientEntry = (args, pluginOptions) => {
  let offsetY = 0;
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY;
  }
  // This code is only so scrolling to header hashes works in development.
  // For production, the equivalent code is in gatsby-ssr.js.
  if (process.env.NODE_ENV !== `production`) {
    scrollToHash(offsetY);
  }
};

exports.onRouteUpdate = (args, pluginOptions) => {
  let offsetY = 0;
  if (pluginOptions.offsetY) {
    offsetY = pluginOptions.offsetY;
  }

  scrollToHash(offsetY);
};
