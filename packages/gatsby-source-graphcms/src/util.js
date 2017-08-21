import R from 'ramda'


// If type ends in a non-vowel, we need to append es. Else s.
export const formatTypeName = t => `all${t}${/s$/.test(t) ? `es` : `s`}`

// Get the type name back from a formatted type name.
export const extractTypeName = t => /all(.+(?:s|es))/ig.exec(t)[1]

// Create the query body
export const surroundWithBraces = c => `{${c}}`

// Constructs a query for a given type.
export const constructTypeQuery = type => `
  ${formatTypeName(type.name)} {
    ${R.compose(
      R.join(`\n`),
      R.pluck(`name`)
    )(type.fields)}
  }
`

// Composition which assembles the query to fetch all data.
export const assembleQueries = R.compose(
  surroundWithBraces,
  R.join(`\n`),
  R.map(constructTypeQuery),
  R.path([`__type`,`possibleTypes`])
)
