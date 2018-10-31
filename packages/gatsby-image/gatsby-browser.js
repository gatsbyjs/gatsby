"use strict"

exports.onClientEntry = () => {
  // TODO: remove after successfully accessing this value
  console.log(`process.env.GATSBY_IMAGE_LOAD_POLYFILLS`, process.env.GATSBY_IMAGE_LOAD_POLYFILLS)

  if (process.env.GATSBY_IMAGE_LOAD_POLYFILLS) {
    // IntersectionObserver polyfill for gatsby-image (Safari, IE)
    if (typeof window.IntersectionObserver === `undefined`) {
      import(`intersection-observer`)
    }

    // Object-fit/Object-position polyfill for gatsby-image (IE)
    const testImg = document.createElement(`img`)
    if (
      typeof testImg.style.objectFit === `undefined` ||
      typeof testImg.style.objectPosition === `undefined`
    ) {
      import(`object-fit-images`).then(ObjectFitImages => ObjectFitImages())
    }
  }
}