"use strict"

exports.onClientEntry = () => {
  if (process.env.GATSBY_IMAGE_LOAD_POLYFILLS) {
    // Add object-fit/position polyfill if browser needs it
    const testImg = document.createElement(`img`)
    if (
      typeof testImg.style.objectFit === `undefined` ||
      typeof testImg.style.objectPosition === `undefined`
    ) {
      import(`object-fit-images`).then(ObjectFitImages => ObjectFitImages())
    }
  }
}