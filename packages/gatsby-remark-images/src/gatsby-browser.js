const { imageClass, imageBackgroundClass, imageWrapperClass } = require(`./classes`)

exports.onRouteUpdate = () => {    
    const imageWrappers = document.querySelectorAll(`.${imageWrapperClass}`)

    for (let imageWrapper of imageWrappers) {
        const backgroundElement = imageWrapper.querySelector(`.${imageBackgroundClass}`)
        const imageElement = imageWrapper.querySelector(`.${imageClass}`)
        const onImageLoadHandler = createImageLoadHandler(backgroundElement, imageElement)

        imageElement.complete ? onImageLoadHandler() : imageElement.addEventListener(`load`, onImageLoadHandler)
    }
}

function createImageLoadHandler(background, image) {
    return function() {          
        background.style.opacity = 0
        image.style.opacity = 1
    }
}
