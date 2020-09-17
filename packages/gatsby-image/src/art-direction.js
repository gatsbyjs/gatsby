import React from "react"
import GatsbyImage from "index"

const isBrowser = typeof window !== `undefined`

// DJB2a (XOR variant) is a simple hashing function, reduces input to 32-bits
// Same hashing algorithm as used by `styled-components`.
const SEED = 5381
function djb2a(str) {
  let hash = SEED

  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }

  // Cast to 32-bit uint
  return hash >>> 0
}

// Converts string input to a 32-bit base36 string (0-9, a-z)
// '_' prefix to prevent invalid first chars for CSS class names
const getShortKey = input => `_` + djb2a(input).toString(36)

// Creates the `<style>` element to support media queries.
// `emotion` does similar with `<style>`, it is not HTML5 spec compliant,
// however web browsers do support using `<style>` outside of `<head>`.
const ResponsiveQueries = ({ imageVariants, selectorClass }) => {
  const variantRule = ({ width, height, aspectRatio }) => {
    // '!important' required due to overriding inline styles
    // 'aspectRatio' == fluid data
    const styleOverride = aspectRatio
      ? `padding-bottom: ${100 / aspectRatio}% !important;`
      : `width: ${width}px !important; height: ${height}px !important;`

    return `.${selectorClass} { ${styleOverride} }`
  }

  // If there is an image without a `media` condition, the first result
  // is used as the base style.
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

// Supports Art Direction feature with `<style>` CSS media queries
// to correctly render image variant dimensions until React is ready.
const withArtDirection = props => {
  const { className, ...rest } = props
  const cn = className ? `${className}` : ``

  const imageVariants = props.fluid || props.fixed
  const uniqueKey = !isBrowser
    ? getShortKey(imageVariants.map(v => v.srcSet).join(``))
    : ``

  return (
    <>
      <ResponsiveQueries
        imageVariants={imageVariants}
        selectorClass={uniqueKey}
      />
      <GatsbyImage {...rest} className={`${uniqueKey} ${cn}`} />
    </>
  )
}

export default withArtDirection
