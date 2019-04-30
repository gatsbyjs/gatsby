import "@babel/polyfill"
import React from "react"
import { render, cleanup, fireEvent } from "react-testing-library"
import Image from "../"

afterAll(cleanup)

// The index of the image <picture> tag, as opposed
// to the base64 <picture> tag
const IMAGE_TAG_INDEX = 1

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
    media: `only screen and (max-width: 767px)`,
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
    media: `only screen and (max-width: 767px)`,
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
      {...fluid && { fluid: fluidShapeMock }}
      {...!fluid && { fixed: fixedShapeMock }}
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
      {...fluidImages && { fluidImages: fluidImagesShapeMock }}
      {...!fluidImages && { fixedImages: fixedImagesShapeMock }}
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
    const imageTag = setup().querySelectorAll(`picture img`)[IMAGE_TAG_INDEX]
    expect(imageTag.getAttribute(`src`)).toEqual(`test_image.jpg`)
    expect(imageTag.getAttribute(`srcSet`)).toEqual(`some srcSet`)
    expect(imageTag.getAttribute(`title`)).toEqual(`Title for the image`)
    expect(imageTag.getAttribute(`alt`)).toEqual(`Alt text for the image`)
    expect(imageTag.getAttribute(`crossOrigin`)).toEqual(`anonymous`)
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
    const component = setup(false, { durationFadeIn: `1000` })
    expect(component).toMatchSnapshot()
  })

  it(`should call onLoad and onError image events`, () => {
    const onLoadMock = jest.fn()
    const onErrorMock = jest.fn()
    const imageTag = setup(true, {}, onLoadMock, onErrorMock).querySelectorAll(
      `picture img`
    )[IMAGE_TAG_INDEX]
    fireEvent.load(imageTag)
    fireEvent.error(imageTag)

    expect(onLoadMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledTimes(1)
  })
})
