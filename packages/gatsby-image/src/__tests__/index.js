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
}

const fluidShapeMock = {
  aspectRatio: 1.5,
  src: `test_image.jpg`,
  srcSet: `some srcSet`,
  sizes: `(max-width: 600px) 100vw, 600px`,
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
    const imageTag = setup().querySelector(`img`)
    expect(imageTag.getAttribute(`src`)).toEqual(`test_image.jpg`)
    expect(imageTag.getAttribute(`title`)).toEqual(`Title for the image`)
    expect(imageTag.getAttribute(`alt`)).toEqual(`Alt text for the image`)
  })

  it(`should call onLoad and onError image events`, () => {
    const onLoadMock = jest.fn()
    const onErrorMock = jest.fn()
    const imageTag = setup(true, onLoadMock, onErrorMock).querySelector(`img`)
    fireEvent.load(imageTag)
    fireEvent.error(imageTag)

    expect(onLoadMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledTimes(1)
  })
})
