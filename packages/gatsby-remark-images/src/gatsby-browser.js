const {
  imageClass,
  imageBackgroundClass,
  imageWrapperClass,
} = require(`./constants`)

exports.onRouteUpdate = () => {
  const imageWrappers = document.querySelectorAll(`.${imageWrapperClass}`)

  Array.prototype.forEach.call(imageWrappers, imageWrapper => {
    const backgroundElement = imageWrapper.querySelector(
      `.${imageBackgroundClass}`
    )
    const imageElement = imageWrapper.querySelector(`.${imageClass}`)

    const onImageLoad = () => {
      backgroundElement.style.opacity = 0
      imageElement.style.opacity = 1
      imageElement.removeEventListener(`load`, onImageLoad)
    }

    if (imageElement.complete) {
      backgroundElement.style.opacity = 0
    } else {
      imageElement.style.opacity = 0
      imageElement.style.transition = `opacity 0.5s`
      imageElement.addEventListener(`load`, onImageLoad)
    }
  })
}
