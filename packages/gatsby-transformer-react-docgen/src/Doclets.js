const metadata = require(`react-docgen`)

const DOCLET_PATTERN = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gim
const { hasOwnProperty: has } = Object.prototype
let cleanDocletValue = str => {
  str = str.trim()
  if (str.endsWith(`}`) && str.startsWith(`{`)) str = str.slice(1, -1)
  return str
}

let isLiteral = str => /^('|"|true|false|\d+)/.test(str.trim())

/**
 * Remove doclets from string
 */
export const cleanDoclets = desc => {
  desc = desc || ``
  let idx = desc.search(DOCLET_PATTERN)
  return (idx === -1 ? desc : desc.substr(0, idx)).trim()
}

/**
 * parse out description doclets to an object and remove the comment
 *
 * @param  {ComponentMetadata|PropMetadata} obj
 */
export const parseDoclets = obj => {
  let desc = obj.description || ``
  return metadata.utils.docblock.getDoclets(desc) || Object.create(null)
}

/**
 * Reads the JSDoc "doclets" and applies certain ones to the prop type data
 * This allows us to "fix" parsing errors, or unparsable data with JSDoc
 * style comments
 *
 * @param  {Object} props     Object Hash of the prop metadata
 * @param  {String} propName
 */
export const applyPropDoclets = prop => {
  let doclets = prop.doclets
  let value

  // the @type doclet to provide a prop type
  // Also allows enums (oneOf) if string literals are provided
  // ex: @type {("optionA"|"optionB")}
  if (doclets.type) {
    value = cleanDocletValue(doclets.type)
    prop.type.name = value

    if (value[0] === `(`) {
      value = value.substring(1, value.length - 1).split(`|`)
      const name = value.every(isLiteral) ? `enum` : `union`
      prop.type.name = name
      prop.type.value = value.map(
        value =>
          name === `enum` ? { value, computed: false } : { name: value }
      )
    }
  }

  // Use @required to mark a prop as required
  // useful for custom propTypes where there isn't a `.isRequired` addon
  if (doclets.required) {
    prop.required = true
  }
  const dft = has.call(doclets, `default`)
    ? doclets.default
    : doclets.defaultValue
  // Use @defaultValue to provide a prop's default value
  if (dft != null) {
    prop.defaultValue = {
      value: dft,
      computed: false,
    }
  }
  return prop
}
