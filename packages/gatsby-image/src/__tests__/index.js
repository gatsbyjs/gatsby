import "@babel/polyfill"
import React from "react"
import { render, cleanup, fireEvent } from "react-testing-library"
import Img from "../"

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

const setup = (fluid = false, onLoad = () => {}, onError = () => {}) => {
  const { container } = render(
    <Img
      backgroundColor
      className={`fixedImage`}
      style={{ display: `inline` }}
      title={`Title for the image`}
      alt={`Alt text for the image`}
      {...fluid && { fluid: fluidShapeMock }}
      {...!fluid && { fixed: fixedShapeMock }}
      onLoad={onLoad}
      onError={onError}
      placeholderStyle={{ color: `red` }}
      placeholderClassName={`placeholder`}
    />
  )

  return container
}

describe(`<Img />`, () => {
  it(`should render fixed size images`, () => {
    const component = setup()
    expect(component).toMatchSnapshot()
  })

  it(`should render fluid images`, () => {
    const component = setup(true)
    expect(component).toMatchSnapshot()
  })

  it(`should have correct src, title and alt attributes`, () => {
    const imageTag = setup().querySelector(`picture img`)
    expect(imageTag.getAttribute(`src`)).toEqual(`test_image.jpg`)
    expect(imageTag.getAttribute(`title`)).toEqual(`Title for the image`)
    expect(imageTag.getAttribute(`alt`)).toEqual(`Alt text for the image`)
  })

  it(`should have correct placeholder src, title, style and class attributes`, () => {
    const placeholderImageTag = setup().querySelector(`img`)
    expect(placeholderImageTag.getAttribute(`src`)).toEqual(`string_of_base64`)
    expect(placeholderImageTag.getAttribute(`title`)).toEqual(
      `Title for the image`
    )
    // No Intersection Observer in JSDOM, so placeholder img will be visible (opacity 1) by default
    expect(placeholderImageTag.getAttribute(`style`)).toEqual(
      `position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; opacity: 1; color: red;`
    )
    expect(placeholderImageTag.getAttribute(`class`)).toEqual(`placeholder`)
  })

  it(`should call onLoad and onError image events`, () => {
    const onLoadMock = jest.fn()
    const onErrorMock = jest.fn()
    const imageTag = setup(true, onLoadMock, onErrorMock).querySelector(
      `picture img`
    )
    fireEvent.load(imageTag)
    fireEvent.error(imageTag)

    expect(onLoadMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledTimes(1)
  })
})
