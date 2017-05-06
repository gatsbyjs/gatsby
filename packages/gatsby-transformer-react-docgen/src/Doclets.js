const metadata = require(`react-docgen`)

let cleanDocletValue = str => str.trim().replace(/^\{/, ``).replace(/\}$/, ``)

let isLiteral = str => /^('|")/.test(str.trim())

/**
 * Remove doclets from string
 */
const cleanDoclets = desc => {
  let idx = desc.indexOf(`@`)
  return (idx === -1 ? desc : desc.substr(0, idx)).trim()
}

/**
 * parse out description doclets to an object and remove the comment
 *
 * @param  {ComponentMetadata|PropMetadata} obj
 */
export const parseDoclets = (obj, propName) => {
  let desc = obj.description || ``
  obj.doclets = metadata.utils.docblock.getDoclets(desc) || {}
  obj.description = cleanDoclets(desc)
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

      prop.type.value = value
      prop.type.name = value.every(isLiteral) ? `enum` : `union`
    }
  }

  // Use @required to mark a prop as required
  // useful for custom propTypes where there isn't a `.isRequired` addon
  if (doclets.required) {
    prop.required = true
  }

  // Use @defaultValue to provide a prop's default value
  if (doclets.defaultValue) {
    prop.defaultValue = {
      value: cleanDocletValue(doclets.defaultValue),
      computed: false,
    }
  }
}
