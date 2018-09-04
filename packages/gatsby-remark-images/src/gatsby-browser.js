const { imageClass, imageBackgroundClass, imageWrapperClass } = require(`./classes`)

exports.onRouteUpdate = () => {    
    const imageWrappers = document.querySelectorAll(`.${imageWrapperClass}`)

    Array.prototype.forEach.call(imageWrappers, (imageWrapper) => {
        const backgroundElement = imageWrapper.querySelector(`.${imageBackgroundClass}`)
        const imageElement = imageWrapper.querySelector(`.${imageClass}`)

        // set the opacity to zero after we identify matching images
        // to avoid issues where this script loads incorrectly
        // resulting in hidden images
        imageElement.style.opacity = 0

        const imageLoadHandler = createImageLoadHandler(backgroundElement, imageElement)

        imageElement.complete ? imageLoadHandler() : imageElement.addEventListener(`load`, imageLoadHandler)
    })
}

function createImageLoadHandler(background, image) {
    return function() {          
        background.style.opacity = 0
        image.style.opacity = 1
    }
}
