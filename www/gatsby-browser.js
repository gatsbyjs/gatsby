exports.onRouteUpdate = (location) => {
  const hash = location.hash || (location.location && location.location.hash)
  if (hash) {
    setTimeout(() => {
      console.log('yo')
      //document.querySelector(`${hash}`).scrollIntoView()
    }, 0);
  }
};