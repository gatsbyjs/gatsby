import React from "react"
import PropTypes from "prop-types"
const logDeprecationNotice = (prop, replacement) => {
  if (process.env.NODE_ENV === `production`) {
    return
  }
  console.log(
    `
    The "${prop}" prop is now deprecated and will be removed in the next major version
    of "gatsby-image".
    `
  )
  if (replacement) {
    console.log(`Please use ${replacement} instead of "${prop}".`)
  }
}
// DJB2a (XOR variant) is a simple hashing function, reduces input to 32-bits
const SEED = 5381
function djb2a(str) {
  let h = SEED
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i)
  }
  // Cast to 32-bit uint
  return h >>> 0
}
// Converts string input to a 32-bit base36 string (0-9, a-z)
// '_' prefix to prevent invalid first chars for CSS class names
const getShortKey = input => `_` + djb2a(input).toString(36)
// Handle legacy props during their deprecation phase
const convertProps = props => {
  let convertedProps = { ...props }
  const { resolutions, sizes, critical } = convertedProps
  if (resolutions) {
    convertedProps.fixed = resolutions
    delete convertedProps.resolutions
  }
  if (sizes) {
    convertedProps.fluid = sizes
    delete convertedProps.sizes
  }
  if (critical) {
    logDeprecationNotice(`critical`, `the native "loading" attribute`)
    convertedProps.loading = `eager`
  }
  // convert fluid & fixed to arrays so we only have to work with arrays
  if (convertedProps.fluid) {
    convertedProps.fluid = groupByMedia([].concat(convertedProps.fluid))
  }
  if (convertedProps.fixed) {
    convertedProps.fixed = groupByMedia([].concat(convertedProps.fixed))
  }
  return convertedProps
}
/**
 * Checks if fluid or fixed are art-direction arrays.
 *
 * @param currentData  {{media?: string}[]}   The props to check for images.
 * @return {boolean}
 */
const hasArtDirectionSupport = currentData =>
  !!currentData &&
  Array.isArray(currentData) &&
  currentData.some(image => typeof image.media !== `undefined`)
/**
 * Tries to detect if a media query matches the current viewport.
 * @property media   {{media?: string}}  A media query string.
 * @return {boolean}
 */
const matchesMedia = ({ media }) =>
  media ? isBrowser && !!window.matchMedia(media).matches : false
/**
 * Find the source of an image to use as a key in the image cache.
 * Use `the first image in either `fixed` or `fluid`
 * @param {{fluid: {src: string, media?: string}[], fixed: {src: string, media?: string}[]}} args
 * @return {string?} Returns image src or undefined it not given.
 */
const getImageCacheKey = ({ fluid, fixed }) => {
  const srcData = getCurrentSrcData(fluid || fixed || [])
  return srcData && srcData.src
}
/**
 * Returns the current src - Preferably with art-direction support.
 * @param currentData  {{media?: string}[], maxWidth?: Number, maxHeight?: Number}   The fluid or fixed image array.
 * @return {{src: string, media?: string, maxWidth?: Number, maxHeight?: Number}}
 */
const getCurrentSrcData = currentData => {
  if (isBrowser && hasArtDirectionSupport(currentData)) {
    // Do we have an image for the current Viewport?
    const foundMedia = currentData.findIndex(matchesMedia)
    if (foundMedia !== -1) {
      return currentData[foundMedia]
    }
    // No media matches, select first element without a media condition
    const noMedia = currentData.findIndex(
      image => typeof image.media === `undefined`
    )
    if (noMedia !== -1) {
      return currentData[noMedia]
    }
  }
  // Else return the first image.
  return currentData[0]
}
// Cache if we've seen an image before so we don't bother with
// lazy-loading & fading in on subsequent mounts.
const imageCache = Object.create({})
const inImageCache = props => {
  const convertedProps = convertProps(props)
  const cacheKey = getImageCacheKey(convertedProps)
  return imageCache[cacheKey] || false
}
const activateCacheForImage = props => {
  const convertedProps = convertProps(props)
  const cacheKey = getImageCacheKey(convertedProps)
  if (cacheKey) {
    imageCache[cacheKey] = true
  }
}
// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
const hasNativeLazyLoadSupport =
  typeof HTMLImageElement !== `undefined` &&
  `loading` in HTMLImageElement.prototype
const isBrowser = typeof window !== `undefined`
const hasIOSupport = isBrowser && window.IntersectionObserver
let io
const listeners = new WeakMap()
function getIO() {
  if (
    typeof io === `undefined` &&
    typeof window !== `undefined` &&
    window.IntersectionObserver
  ) {
    io = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (listeners.has(entry.target)) {
            const cb = listeners.get(entry.target)
            // Edge doesn't currently support isIntersecting, so also test for an intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io.unobserve(entry.target)
              listeners.delete(entry.target)
              cb()
            }
          }
        })
      },
      { rootMargin: `200px` }
    )
  }
  return io
}
function generateImageSources(imageVariants) {
  return imageVariants.map(({ src, srcSet, srcSetWebp, media, sizes }) => (
    <React.Fragment key={src}>
      {srcSetWebp && (
        <source
          type="image/webp"
          media={media}
          srcSet={srcSetWebp}
          sizes={sizes}
        />
      )}
      <source media={media} srcSet={srcSet} sizes={sizes} />
    </React.Fragment>
  ))
}
// Return an array ordered by elements having a media prop, does not use
// native sort, as a stable sort is not guaranteed by all browsers/versions
function groupByMedia(imageVariants) {
  const withMedia = []
  const without = []
  imageVariants.forEach(variant =>
    (variant.media ? withMedia : without).push(variant)
  )
  if (without.length > 1 && process.env.NODE_ENV !== `production`) {
    console.warn(
      `We've found ${without.length} sources without a media property. They might be ignored by the browser, see: https://www.gatsbyjs.org/packages/gatsby-image/#art-directing-multiple-images`
    )
  }
   return [...withMedia, ...without]
 }

 // For Art Direction: SSR + Initial load, removed upon rehydration
 // Ensures correct CSS for image variants is applied
 const ResponsiveQueries = ({ imageVariants, selectorClass }) => {
   const variantRule = ({ width, height, aspectRatio }) => {
     // '!important' required due to overriding inline styles
     // 'aspectRatio' == fluid data
     const styleOverride = aspectRatio
       ? `padding-bottom: ${100 / aspectRatio}% !important;`
       : `width: ${width}px !important; height: ${height}px !important;`

     return `.${selectorClass} { ${styleOverride} }`
   }

   const base = variantRule(imageVariants.find(v => !v.media))
   return (
     <>
       {base && <style>{base}</style>}
       {imageVariants
         .filter(v => v.media)
         .map(v => (
           <style media={v.media}>{variantRule(v)}</style>
         ))}
     </>
   )
 }

 function generateTracedSVGSources(imageVariants) {
   return imageVariants.map(({ src, media, tracedSVG }) => (
     <source key={src} media={media} srcSet={tracedSVG} />
 @@ -523,6 +549,13 @@ class Image extends React.Component {
           ref={this.handleRef}
           key={activeVariant}
         >
           {uniqueKey && (
             <ResponsiveQueries
               imageVariants={imageVariants}
               selectorClass={uniqueKey}
             />
           )}

           {/* Preserve the aspect ratio. */}
           <Tag
             aria-hidden
 @@ -637,6 +670,13 @@ class Image extends React.Component {
           ref={this.handleRef}
           key={activeVariant}
         >
           {uniqueKey && (
             <ResponsiveQueries
               imageVariants={imageVariants}
               selectorClass={uniqueKey}
             />
           )}

           {/* Show a solid background color. */}
           {bgColor && (
             <Tag
