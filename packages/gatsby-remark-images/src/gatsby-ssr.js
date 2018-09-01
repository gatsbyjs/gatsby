import { imageClass, imageBackgroundClass, imageWrapperClass } from "./classes";

exports.onRenderBody = (
    { setHeadComponents, setHtmlAttributes, setBodyAttributes },
    pluginOptions
  ) => {    
    const imageWrappers = document.querySelectorAll(`.${imageWrapperClass}`)
      
    for (let i = 0, imageWrapper; imageWrapper = imageWrappers[i]; i++) {
      const backgroundElement = imageWrapper.querySelector(`.${imageBackgroundClass}`)
      const imageElement = imageWrapper.querySelector(`.${imageClass}`)
      const onImageLoadHandler = createImageLoadHandler(backgroundElement, imageElement)

      imageElement.complete ? onImageLoadHandler() : imageElement.addEventListener(`load`, onImageLoadHandler)
    }
}
    
function createImageLoadHandler(background, image) {
  return function () {          
    background.style.opacity = 0;
    image.style.opacity = 1;
  }
}
