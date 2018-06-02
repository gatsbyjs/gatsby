import PropTypes from "prop-types"

// Base

const aspectRatio = PropTypes.number.isRequired
const base64 = PropTypes.string.isRequired
const src = PropTypes.string.isRequired
const srcSet = PropTypes.string.isRequired
const srcWebp = PropTypes.string.isRequired
const srcSetWebp = PropTypes.string.isRequired
const tracedSVG = PropTypes.string.isRequired

const width = PropTypes.number.isRequired
const height = PropTypes.number.isRequired

const sizes = PropTypes.string.isRequired

// Fixed

const fixedNoBase64 = PropTypes.shape({
  width,
  height,
  src,
  srcSet,
})

const fixed = PropTypes.shape({
  base64,
  ...fixedNoBase64,
})

const fixedTracedSVG = PropTypes.shape({
  ...fixed,
  tracedSVG,
})

const fixedWebp = PropTypes.shape({
  ...fixed,
  srcWebp,
  srcSetWebp,
})

const fixedWebpTracedSVG = PropTypes.shape({
  ...fixed,
  srcWebp,
  srcSetWebp,
  tracedSVG,
})

const fixedWebpNoBase64 = PropTypes.shape({
  ...fixedNoBase64,
  srcWebp,
  srcSetWebp,
})

export const anyFixed = PropTypes.oneOfType([
  fixed,
  fixedTracedSVG,
  fixedWebp,
  fixedWebpTracedSVG,
  fixedNoBase64,
  fixedWebpNoBase64,
])

// Fluid

const fluidNoBase64 = PropTypes.shape({
  aspectRatio,
  src,
  srcSet,
  sizes,
})

const fluid = PropTypes.shape({
  base64,
  ...fluidNoBase64,
})

const fluidTracedSVG = PropTypes.shape({
  ...fluid,
  tracedSVG,
})

const fluidWebp = PropTypes.shape({
  ...fluid,
  srcWebp,
  srcSetWebp,
})

const fluidWebpTracedSVG = PropTypes.shape({
  ...fluid,
  srcWebp,
  srcSetWebp,
  tracedSVG,
})

const fluidWebpNoBase64 = PropTypes.shape({
  ...fluidNoBase64,
  srcWebp,
  srcSetWebp,
})

export const anyFluid = PropTypes.oneOfType([
  fluid,
  fluidTracedSVG,
  fluidWebp,
  fluidWebpTracedSVG,
  fluidNoBase64,
  fluidWebpNoBase64,
])
