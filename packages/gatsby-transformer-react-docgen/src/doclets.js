const DOCLET_PATTERN = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gim

const cleanDocletValue = str => {
  str = str.trim()
  if (str.endsWith(`}`) && str.startsWith(`{`)) str = str.slice(1, -1)
  return str
}

const isLiteral = str => /^('|"|true|false|\d+)/.test(str.trim())

/**
 * Remove doclets from string
 */
export const cleanDoclets = desc => {
  desc = desc || ``
  const idx = desc.search(DOCLET_PATTERN)
  return (idx === -1 ? desc : desc.slice(0, idx)).trim()
}

/**
 * Given a string, this function returns an object with doclet names as keys
 * and their "content" as values.
 *
 * Adapted from https://github.com/reactjs/react-docgen/blob/ee8a5359c478b33a6954f4546637312764798d6b/src/utils/docblock.js#L62
 * Updated to strip \r from the end of doclets
 */
const getDoclets = str => {
  const doclets = []
  let match = DOCLET_PATTERN.exec(str)
  let val

  for (; match; match = DOCLET_PATTERN.exec(str)) {
    val = match[2] ? match[2].replace(/\r$/, ``) : true
    const key = match[1]
    doclets.push({ tag: key, value: val })
  }
  return doclets
}

/**
 * parse out description doclets to an object and remove the comment
 *
 * @param  {ComponentMetadata|PropMetadata} obj
 */
export const parseDoclets = obj => {
  const desc = obj.description || ``
  return getDoclets(desc) || Object.create(null)
}

function parseType(type) {
  if (!type) {
    return undefined
  }

  const { name, raw } = type

  if (name === `union`) {
    return {
      name,
      value: raw.split(`|`).map(v => {
        return { name: v.trim() }
      }),
    }
  }

  if (name === `enum`) {
    return { ...type }
  }

  if (raw) {
    return {
      name: raw,
    }
  }

  return { ...type }
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
  prop.doclets.forEach(({ tag, value }) => {
    // the @type doclet to provide a prop type
    // Also allows enums (oneOf) if string literals are provided
    // ex: @type {("optionA"|"optionB")}
    if (tag === `type`) {
      value = cleanDocletValue(value)

      if (prop.type === undefined) {
        prop.type = {}
      }

      prop.type.name = value

      if (value[0] === `(`) {
        value = value
          .substring(1, value.length - 1)
          .split(`|`)
          .map(v => v.trim())
        const name = value.every(isLiteral) ? `enum` : `union`
        prop.type.name = name
        prop.type.value = value.map(value =>
          name === `enum` ? { value, computed: false } : { name: value }
        )
      }
      return
    }

    // Use @required to mark a prop as required
    // useful for custom propTypes where there isn't a `.isRequired` addon
    if (tag === `required` && value) {
      prop.required = true
      return
    }

    // Use @defaultValue to provide a prop's default value
    if ((tag === `default` || tag === `defaultValue`) && value != null) {
      prop.defaultValue = { value, computed: false }
      return
    }
  })

  // lookup for tsTypes or flowTypes
  if (prop.type === undefined) {
    prop.type = parseType(prop.tsType) || parseType(prop.flowType)
  }

  return prop
}
