const {
  targets: listOfPolyfillsByTarget, // object with targets for each module
} = require(`core-js-compat`)({
  // get polyfills for either IE11 or chrome > 60 or safari < 12.1
  // seems like there are a few bugs in safari 12 & 12.1, I rather not add them to our bundle
  targets: `IE 11, chrome > 60, safari <= 12.1`,
  filter: /^(es)\./,
})

const listOfIEPolyfills = []
Object.keys(listOfPolyfillsByTarget).forEach(polyfill => {
  const targets = listOfPolyfillsByTarget[polyfill]
  // only add a list of polyfills that are necessary for IE, we don't want to exclude promise.finally...
  if (!targets.chrome) {
    listOfIEPolyfills.push(polyfill)
  }
})

module.exports = {
  IMPORTED_POLYFILLS: [
    `features/array/copy-within`,
    `features/array/fill`,
    `features/array/find`,
    `features/array/find-index`,
    `features/array/flat-map`,
    `features/array/flat`,
    `features/array/from`,
    `features/array/includes`,
    `features/array/iterator`,
    `features/array/of`,
    `features/function/has-instance`,
    `features/function/name`,
    `features/map`,
    `features/set`,
    `features/weak-map`,
    `features/weak-set`,
    `features/number/constructor`,
    `features/number/epsilon`,
    `features/number/is-finite`,
    `features/number/is-integer`,
    `features/number/is-nan`,
    `features/number/is-safe-integer`,
    `features/number/max-safe-integer`,
    `features/number/min-safe-integer`,
    `features/object/entries`,
    `features/object/get-own-property-descriptors`,
    `features/object/is`,
    `features/object/keys`,
    `features/object/values`,
    `features/string/code-point-at`,
    `features/string/ends-with`,
    `features/string/from-code-point`,
    `features/string/includes`,
    `features/string/iterator`,
    `features/string/pad-start`,
    `features/string/pad-end`,
    `features/string/raw`,
    `features/string/repeat`,
    `features/string/starts-with`,
    `features/string/trim-start`,
    `features/string/trim-end`,
    `features/reflect`,
    `features/regexp`,
    `features/symbol`,
    `features/promise`,
  ],
  // features like regexp, reflect are not stored as es.regexp in core-js, this is a map that converts it
  EXCLUDED_POLYFILLS: [
    ...listOfIEPolyfills,
    `es.object.assign`,

    // These are added by default as the check in babel-preset-env isn't thorough enough
    // ex if .forEach is used it adds a bunch of iterator polyfills even if it has nothing to do with that
    `es.array.iterator`,
    `es.promise`,
    `es.symbol.description`,
    `web.*`,
  ],
}
