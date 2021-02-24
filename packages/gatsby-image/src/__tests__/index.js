import React from "react"
import { render, cleanup, fireEvent } from "@testing-library/react"
import MatchMediaMock from "jest-matchmedia-mock"
import Image from "../"

afterAll(cleanup)

const fixedShapeMock = {
  width: 100,
  height: 100,
  src: `test_image.jpg`,
  srcSet: `some srcSet`,
  srcSetWebp: `some srcSetWebp`,
  base64: `string_of_base64`,
}

const fluidShapeMock = {
  aspectRatio: 1.5,
  src: `test_image.jpg`,
  srcSet: `some srcSet`,
  srcSetWebp: `some srcSetWebp`,
  sizes: `(max-width: 600px) 100vw, 600px`,
  base64: `string_of_base64`,
}

const fixedImagesShapeMock = [
  {
    width: 100,
    height: 100,
    src: `test_image.jpg`,
    srcSet: `some srcSet`,
    srcSetWebp: `some srcSetWebp`,
    base64: `string_of_base64`,
  },
  {
    width: 300,
    height: 300,
    src: `test_image_2.jpg`,
    srcSet: `some other srcSet`,
    srcSetWebp: `some other srcSetWebp`,
    base64: `other_string_of_base64`,
    media: `only screen and (min-width: 768px)`,
  },
]

const fluidImagesShapeMock = [
  {
    aspectRatio: 2,
    src: `test_image.jpg`,
    srcSet: `some srcSet`,
    srcSetWebp: `some srcSetWebp`,
    sizes: `(max-width: 600px) 100vw, 600px`,
    base64: `string_of_base64`,
  },
  {
    aspectRatio: 3,
    src: `test_image_2.jpg`,
    srcSet: `some other srcSet`,
    srcSetWebp: `some other srcSetWebp`,
    sizes: `(max-width: 600px) 100vw, 600px`,
    base64: `string_of_base64`,
    media: `only screen and (min-width: 768px)`,
  },
]

const setup = (
  fluid = false,
  props = {},
  onLoad = () => {},
  onError = () => {}
) => {
  const { container } = render(
    <Image
      backgroundColor
      className={`fixedImage`}
      style={{ display: `inline` }}
      title={`Title for the image`}
      alt={`Alt text for the image`}
      crossOrigin={`anonymous`}
      draggable={true}
      {...(fluid && { fluid: fluidShapeMock })}
      {...(!fluid && { fixed: fixedShapeMock })}
      onLoad={onLoad}
      onError={onError}
      itemProp={`item-prop-for-the-image`}
      placeholderStyle={{ color: `red` }}
      placeholderClassName={`placeholder`}
      {...props}
    />
  )

  return container
}

const setupImages = (
  fluidImages = false,
  onLoad = () => {},
  onError = () => {}
) => {
  const { container } = render(
    <Image
      backgroundColor
      className={`fixedImage`}
      style={{ display: `inline` }}
      title={`Title for the image`}
      alt={`Alt text for the image`}
      crossOrigin={`anonymous`}
      {...(fluidImages && { fluid: fluidImagesShapeMock })}
      {...(!fluidImages && { fixed: fixedImagesShapeMock })}
      onLoad={onLoad}
      onError={onError}
      itemProp={`item-prop-for-the-image`}
      placeholderStyle={{ color: `red` }}
      placeholderClassName={`placeholder`}
    />
  )

  return container
}

let matchMedia
describe(`<Image />`, () => {
  beforeAll(() => {
    matchMedia = new MatchMediaMock()
  })
  afterEach(() => {
    matchMedia.clear()
  })

  it(`should render fixed size images`, () => {
    const component = setup()
    expect(component).toMatchSnapshot()
  })

  it(`should render fluid images`, () => {
    const component = setup(true)
    expect(component).toMatchSnapshot()
  })

  it(`should render multiple fixed image variants`, () => {
    const component = setupImages()
    expect(component).toMatchSnapshot()
  })

  it(`should render multiple fluid image variants`, () => {
    const component = setupImages(true)
    expect(component).toMatchSnapshot()
  })

  it(`should have correct src, title, alt, and crossOrigin attributes`, () => {
    const imageTag = setup().querySelector(`picture img`)
    expect(imageTag.getAttribute(`src`)).toEqual(`test_image.jpg`)
    expect(imageTag.getAttribute(`srcSet`)).toEqual(`some srcSet`)
    expect(imageTag.getAttribute(`title`)).toEqual(`Title for the image`)
    expect(imageTag.getAttribute(`alt`)).toEqual(`Alt text for the image`)
    expect(imageTag.getAttribute(`crossOrigin`)).toEqual(`anonymous`)
    expect(imageTag.getAttribute(`loading`)).toEqual(`lazy`)
    expect(imageTag.getAttribute(`draggable`)).toEqual(`true`)
  })

  it(`should have correct placeholder src, title, style and class attributes`, () => {
    const placeholderImageTag = setup().querySelector(`img`)
    expect(placeholderImageTag.getAttribute(`src`)).toEqual(`string_of_base64`)
    expect(placeholderImageTag.getAttribute(`title`)).toEqual(
      `Title for the image`
    )
    // No Intersection Observer in JSDOM, so placeholder img will be visible (opacity 1) by default
    expect(placeholderImageTag.getAttribute(`style`)).toEqual(
      `position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 1; transition-delay: 500ms; color: red;`
    )
    expect(placeholderImageTag.getAttribute(`class`)).toEqual(`placeholder`)
  })

  it(`should have a transition-delay of 1sec`, () => {
    const component = setup(false, { durationFadeIn: 1000 })
    expect(component).toMatchSnapshot()
  })

  it(`should have the "critical" prop set "loading='eager'"`, () => {
    jest.spyOn(global.console, `log`)

    const props = { critical: true }
    const imageTag = setup(false, props).querySelector(`picture img`)
    expect(imageTag.getAttribute(`loading`)).toEqual(`eager`)
    expect(console.log).toBeCalled()
  })

  it(`should warn if image variants provided are missing media keys.`, () => {
    jest.spyOn(global.console, `warn`)

    render(
      <Image
        backgroundColor
        className={`fixedImage`}
        style={{ display: `inline` }}
        title={`Title for the image`}
        alt={`Alt text for the image`}
        crossOrigin={`anonymous`}
        fluid={fluidImagesShapeMock.concat({
          aspectRatio: 2,
          src: `test_image_3.jpg`,
          srcSet: `some other srcSet`,
          srcSetWebp: `some other srcSetWebp`,
          sizes: `(max-width: 600px) 100vw, 600px`,
          base64: `string_of_base64`,
        })}
        itemProp={`item-prop-for-the-image`}
        placeholderStyle={{ color: `red` }}
        placeholderClassName={`placeholder`}
      />
    )
    expect(console.warn).toBeCalled()
  })

  it(`should warn if missing both fixed and fluid props`, () => {
    jest.spyOn(global.console, `error`)

    render(<Image fixed={null} />)

    expect(console.error).toBeCalledWith(
      expect.stringContaining(
        `The prop \`fluid\` or \`fixed\` is marked as required`
      )
    )
  })

  it(`should select the correct mocked image of fluid variants provided.`, () => {
    const mediaQuery = `only screen and (min-width: 1024px)`
    matchMedia.useMediaQuery(mediaQuery)

    const tripleFluidImageShapeMock = fluidImagesShapeMock.concat({
      aspectRatio: 5,
      src: `test_image_4.jpg`,
      srcSet: `third other srcSet`,
      srcSetWebp: `third other srcSetWebp`,
      sizes: `(max-width: 1920px) 100vw, 1920px`,
      base64: `string_of_base64`,
      media: `only screen and (min-width: 1024px)`,
    })
    const { container } = render(
      <Image
        backgroundColor
        className={`fluidArtDirectedImage`}
        style={{ display: `inline` }}
        title={`Title for the image`}
        alt={`Alt text for the image`}
        crossOrigin={`anonymous`}
        fluid={tripleFluidImageShapeMock}
        itemProp={`item-prop-for-the-image`}
        placeholderStyle={{ color: `red` }}
        placeholderClassName={`placeholder`}
      />
    )
    const aspectPreserver = container.querySelector(`div div div`)
    expect(aspectPreserver.getAttribute(`style`)).toEqual(
      expect.stringMatching(/padding-bottom: 20%/)
    )
  })

  it(`should select the correct mocked image of fixed variants provided.`, () => {
    const mediaQuery = `only screen and (min-width: 1024px)`
    matchMedia.useMediaQuery(mediaQuery)

    const tripleFixedImageShapeMock = fixedImagesShapeMock.concat({
      width: 1024,
      height: 768,
      src: `test_image_4.jpg`,
      srcSet: `third other srcSet`,
      srcSetWebp: `third other srcSetWebp`,
      base64: `string_of_base64`,
      media: `only screen and (min-width: 1024px)`,
    })
    const { container } = render(
      <Image
        backgroundColor
        className={`fixedArtDirectedImage`}
        style={{ display: `inline` }}
        title={`Title for the image`}
        alt={`Alt text for the image`}
        crossOrigin={`anonymous`}
        fixed={tripleFixedImageShapeMock}
        itemProp={`item-prop-for-the-image`}
        placeholderStyle={{ color: `red` }}
        placeholderClassName={`placeholder`}
      />
    )
    const aspectPreserver = container.querySelector(`div div`)
    expect(aspectPreserver.getAttribute(`style`)).toEqual(
      expect.stringMatching(/width: 1024px; height: 768px;/)
    )
  })

  it(`should select the image with no media query as mocked image of fluid variants provided.`, () => {
    const { container } = render(
      <Image
        backgroundColor
        className={`fluidArtDirectedImage`}
        style={{ display: `inline` }}
        title={`Title for the image`}
        alt={`Alt text for the image`}
        crossOrigin={`anonymous`}
        fluid={fluidImagesShapeMock.slice().reverse()}
        itemProp={`item-prop-for-the-image`}
        placeholderStyle={{ color: `red` }}
        placeholderClassName={`placeholder`}
      />
    )
    const aspectPreserver = container.querySelector(`div div div`)
    expect(aspectPreserver.getAttribute(`style`)).toEqual(
      expect.stringMatching(/padding-bottom: 50%/)
    )
  })

  it(`should select the image with no media query as mocked image of fixed variants provided.`, () => {
    const { container } = render(
      <Image
        backgroundColor
        className={`fixedArtDirectedImage`}
        style={{ display: `inline` }}
        title={`Title for the image`}
        alt={`Alt text for the image`}
        crossOrigin={`anonymous`}
        fixed={fixedImagesShapeMock.slice().reverse()}
        itemProp={`item-prop-for-the-image`}
        placeholderStyle={{ color: `red` }}
        placeholderClassName={`placeholder`}
      />
    )
    const aspectPreserver = container.querySelector(`div div`)
    expect(aspectPreserver.getAttribute(`style`)).toEqual(
      expect.stringMatching(/width: 100px; height: 100px;/)
    )
  })

  it(`should call onLoad and onError image events`, () => {
    const onLoadMock = jest.fn()
    const onErrorMock = jest.fn()
    const imageTag = setup(true, {}, onLoadMock, onErrorMock).querySelector(
      `picture img`
    )
    fireEvent.load(imageTag)
    fireEvent.error(imageTag)

    expect(onLoadMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledTimes(1)
  })

  it(`should have an "aria-hidden" attribute on the fluid element`, () => {
    const divTag = setup(true).querySelector(`.gatsby-image-wrapper > div`)
    expect(divTag.getAttribute(`aria-hidden`)).toBe(`true`)
  })

  it(`should have an "aria-hidden" attribute on the background element`, () => {
    const BgTag = setup(true).querySelector(`.gatsby-image-wrapper > div + div`)
    expect(BgTag.getAttribute(`aria-hidden`)).toBe(`true`)
  })

  it(`should have an "aria-hidden" attribute on the Placeholder component when fluid`, () => {
    const placeholderImageTag = setup(true).querySelector(`img`)
    expect(placeholderImageTag.getAttribute(`aria-hidden`)).toBe(`true`)
  })

  it(`should have an "aria-hidden" attribute on the Placeholder component when fixed`, () => {
    const placeholderImageTag = setup().querySelector(`img`)
    expect(placeholderImageTag.getAttribute(`aria-hidden`)).toBe(`true`)
  })

  it(`should not have an "aria-hidden" attribute on the Image`, () => {
    const placeholderImageTag = setup().querySelector(`picture img`)
    expect(placeholderImageTag.getAttribute(`aria-hidden`)).toBe(null)
  })

  it(`should not have a "source" tag if no srcSet is provided`, () => {
    jest.spyOn(global.console, `warn`)

    const props = {
      fixed: { ...fixedShapeMock, srcSet: null, srcSetWebp: null },
    }
    const sourceTag = setup(false, props).querySelector(`source`)
    expect(sourceTag).toEqual(null)

    expect(console.warn).toBeCalled()
  })
})
