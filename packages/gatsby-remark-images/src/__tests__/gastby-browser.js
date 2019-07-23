const {
  imageClass,
  imageWrapperClass,
  imageBackgroundClass,
} = require(`../constants`)
const { onRouteUpdate } = require(`../gatsby-browser`)

const createImageElement = () => {
  global.document.body.innerHTML = `
    <span class="${imageWrapperClass}">
      <span class="${imageBackgroundClass}"></span>
      <img class="${imageClass}">
    </span>
  `

  return global.document.querySelector(`.${imageClass}`)
}

test(`it sets correct box-shadow on img element`, () => {
  const pluginOptions = {}
  const imageElement = createImageElement()

  onRouteUpdate({}, pluginOptions)
  imageElement.dispatchEvent(new Event(`load`))

  expect(imageElement.style[`box-shadow`]).toBe(`inset 0px 0px 0px 400px white`)
})

test(`it sets correct box-shadow on img element with custom backgroundColor`, () => {
  const pluginOptions = { backgroundColor: `blue` }
  const imageElement = createImageElement()

  onRouteUpdate({}, pluginOptions)
  imageElement.dispatchEvent(new Event(`load`))

  expect(imageElement.style[`box-shadow`]).toBe(`inset 0px 0px 0px 400px blue`)
})
