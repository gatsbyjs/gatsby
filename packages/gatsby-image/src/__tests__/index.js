import "@babel/polyfill"
import React from "react"
import { render, cleanup, fireEvent } from "@testing-library/react"
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
    width: 100,
    height: 100,
    src: `test_image_2.jpg`,
    srcSet: `some other srcSet`,
    srcSetWebp: `some other srcSetWebp`,
    base64: `other_string_of_base64`,
    media: `only screen and (min-width: 768px)`,
  },
]

const fluidImagesShapeMock = [
  {
    aspectRatio: 1.5,
    src: `test_image.jpg`,
    srcSet: `some srcSet`,
    srcSetWebp: `some srcSetWebp`,
    sizes: `(max-width: 600px) 100vw, 600px`,
    base64: `string_of_base64`,
  },
  {
    aspectRatio: 2,
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

describe(`<Image />`, () => {
  const OLD_MATCH_MEDIA = window.matchMedia
  beforeEach(() => {
    window.matchMedia = jest.fn(media =>
      media === `only screen and (min-width: 1024px)`
        ? {
            matches: true,
          }
        : {
            matches: false,
          }
    )
  })
  afterEach(() => {
    window.matchMedia = OLD_MATCH_MEDIA
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

  it(`should have the the "critical" prop set "loading='eager'"`, () => {
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

  it(`should select the correct mocked image of fluid variants provided.`, () => {
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
})
