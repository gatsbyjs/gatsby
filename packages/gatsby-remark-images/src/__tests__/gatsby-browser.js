/**
 * @jest-environment jsdom
 */

const {
  DEFAULT_OPTIONS,
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

const defaultImageBoxShadowStyle = `inset 0px 0px 0px 400px ${DEFAULT_OPTIONS.backgroundColor}`

test(`it sets the default box-shadow on img element`, () => {
  const pluginOptions = {}
  const imageElement = createImageElement()

  onRouteUpdate({}, pluginOptions)
  imageElement.dispatchEvent(new Event(`load`))

  expect(imageElement.style[`box-shadow`]).toBe(defaultImageBoxShadowStyle)
  expect(
    window.getComputedStyle(imageElement).getPropertyValue(`box-shadow`)
  ).toBe(defaultImageBoxShadowStyle)
})

const customBackgroundColors = [
  `blue`,
  `#0ff`,
  `#00ffff`,
  `rgb(255, 0, 0)`,
  `rgba(255, 0, 0, 0.3)`,
  `hsl(120, 100%, 50%)`,
  `hsla(120, 100%, 50%, 0.3)`,
  `aqua`,
  `doesnotexist`,
  `none`,
]
customBackgroundColors.forEach(c => {
  test(`it sets box-shadow color to '${c}' on img when backgroundColor is set to '${c}'`, () => {
    const pluginOptions = { backgroundColor: `${c}` }
    const imageElement = createImageElement()

    onRouteUpdate({}, pluginOptions)
    imageElement.dispatchEvent(new Event(`load`))

    expect(imageElement.style[`box-shadow`]).toBe(
      `inset 0px 0px 0px 400px ${c}`
    )
    expect(
      window.getComputedStyle(imageElement).getPropertyValue(`box-shadow`)
    ).toBe(`inset 0px 0px 0px 400px ${c}`)
  })
})
