import * as graphql from "graphql"
import { parse, print } from "recast"
import { transformFromAstSync, parseSync } from "@babel/core"

const propNames = [`fixed`, `fluid`]

const legacyFragments = [
  `GatsbyImageSharpFixed`,
  `GatsbyImageSharpFixed_withWebp`,
  `GatsbyImageSharpFluid`,
  `GatsbyImageSharpFluid_withWebp`,
]

const legacyFragmentsNoPlaceholder = [
  `GatsbyImageSharpFixed_noBase64`,
  `GatsbyImageSharpFixed_withWebp_noBase64`,
  `GatsbyImageSharpFluid_noBase64`,
  `GatsbyImageSharpFluid_withWebp_noBase64`,
]

const legacyFragmentsSVGPlaceholder = [
  `GatsbyImageSharpFixed_tracedSVG`,
  `GatsbyImageSharpFixed_withWebp_tracedSVG`,
  `GatsbyImageSharpFluid_tracedSVG`,
  `GatsbyImageSharpFluid_withWebp_tracedSVG`,
]

const transformOptions = [
  `grayscale`,
  `duotone`,
  `rotate`,
  `trim`,
  `cropFocus`,
  `fit`,
]

const otherOptions = [
  `jpegQuality`,
  `webpQuality`,
  `pngQuality`,
  `pngCompressionSpeed`,
]

const typeMapper = {
  fixed: `FIXED`,
  fluid: `FULL_WIDTH`,
  constrained: `CONSTRAINED`,
}

export default function jsCodeShift(file) {
  if (
    file.path.includes(`node_modules`) ||
    file.path.includes(`.cache`) ||
    file.path.includes(`public`)
  ) {
    return file.source
  }
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}

export function babelRecast(code, filePath) {
  const transformedAst = parse(code, {
    parser: {
      parse: source => runParseSync(source, filePath),
    },
  })

  const changedTracker = { hasChanged: false, filename: filePath } // recast adds extra semicolons that mess with diffs and we want to avoid them

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [[updateImport, changedTracker]],
  }

  const { ast } = transformFromAstSync(transformedAst, code, options)

  if (changedTracker.hasChanged) {
    return print(ast, { lineTerminator: `\n` }).code
  }
  return code
}

function runParseSync(source, filePath) {
  const ast = parseSync(source, {
    plugins: [
      `@babel/plugin-syntax-jsx`,
      `@babel/plugin-proposal-class-properties`,
    ],
    overrides: [
      {
        test: [`**/*.ts`, `**/*.tsx`],
        plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
      },
    ],
    filename: filePath,
    parserOpts: {
      tokens: true, // recast uses this
    },
  })
  if (!ast) {
    console.log(
      `The codemod was unable to parse ${filePath}. If you're running against the '/src' directory and your project has a custom babel config, try running from the root of the project so the codemod can pick it up.`
    )
  }
  return ast
}

export function updateImport(babel) {
  const { types: t, template } = babel
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { node } = path
        if (
          node.source.value !== `gatsby-image` &&
          node.source.value !== `gatsby-plugin-image/compat` &&
          node.source.value !== `gatsby-image/withIEPolyfill`
        ) {
          return
        }
        const localName = path.node.specifiers?.[0]?.local?.name
        const usages = path.scope.getBinding(localName)?.referencePaths
        usages.forEach(item => {
          processImportUsage(item, t, template, state)
        })

        const newImport = template.statement
          .ast`import { GatsbyImage } from "gatsby-plugin-image"`
        path.replaceWith(newImport)
        state.opts.hasChanged = true
        path.skip()
      },
      MemberExpression(path, state) {
        if (
          propNames.includes(path.node.property.name) &&
          path.node?.object?.property?.name === `childImageSharp`
        ) {
          if (
            t.isMemberExpression(path.parent) ||
            t.isOptionalMemberExpression(path.parent)
          ) {
            console.log(
              `It appears you're accessing src or similar. This structure has changed. Please inspect ${state.opts.filename} manually, you likely want to use a helper function like getSrc.`
            )
          }
          const updatedExpression = t.memberExpression(
            path.node.object,
            t.identifier(`gatsbyImageData`)
          )
          path.replaceWith(updatedExpression)
          state.opts.hasChanged = true
        }
      },
      OptionalMemberExpression(path, state) {
        if (
          propNames.includes(path.node.property.name) &&
          path.node?.object?.property?.name === `childImageSharp`
        ) {
          if (
            t.isMemberExpression(path.parent) ||
            t.isOptionalMemberExpression(path.parent)
          ) {
            console.log(
              `It appears you're accessing src or similar. This structure has changed. Please inspect ${state.opts.filename} manually, you likely want to use a helper function like getSrc.`
            )
          }
          const updatedExpression = t.optionalMemberExpression(
            path.node.object,
            t.identifier(`gatsbyImageData`),
            false,
            true
          )
          path.replaceWith(updatedExpression)
          state.opts.hasChanged = true
        }
      },
      TaggedTemplateExpression({ node }, state) {
        if (node.tag.name !== `graphql`) {
          return
        }
        const query = node.quasi?.quasis?.[0]?.value?.raw
        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query, state)

          if (hasChanged) {
            node.quasi.quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
      CallExpression({ node }, state) {
        if (node.callee.name !== `graphql`) {
          return
        }
        const query = node.arguments?.[0].quasis?.[0]?.value?.raw

        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query, state)

          if (hasChanged) {
            node.arguments[0].quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
    },
  }
}

function processImportUsage(path, t, template, state) {
  const node = path.parent

  if (!t.isJSXOpeningElement(node)) {
    path.node.name = `GatsbyImage`
    if (node.superClass?.name === path.node.name) {
      console.log(
        `It appears you are extending the image component in some way. This is not supported in \`gatsby-plugin-image\`, please use composition in ${state.opts.filename} instead.`
      )
      return
    }
    console.log(
      `It appears you are referencing the image component in some way. We've updated the reference, but you will want to verify ${state.opts.filename} manually.`
    )
    return
  }

  const componentName = t.jsxIdentifier(`GatsbyImage`)

  const fixedOrFluid = node.attributes.filter(({ name }) =>
    propNames.includes(name?.name)
  )

  const otherAttributes = node.attributes.filter(
    ({ name }) => !propNames.includes(name?.name)
  )

  if (!fixedOrFluid.length > 0) {
    path.parentPath.replaceWith(
      t.jsxOpeningElement(componentName, [...otherAttributes], true)
    )
    return
  }
  const expressionValue = fixedOrFluid?.[0]?.value?.expression

  let newImageExpression = expressionValue // by default, pass what they pass
  if (
    t.isMemberExpression(expressionValue) &&
    propNames.includes(expressionValue?.property.name)
  ) {
    if (expressionValue?.object?.object) {
      newImageExpression = template.expression
        .ast`${expressionValue?.object?.object}.childImageSharp.gatsbyImageData`
    } else if (expressionValue?.object) {
      newImageExpression = template.expression
        .ast`${expressionValue?.object}.gatsbyImageData`
    }

    newImageExpression.extra.parenthesized = false // the template adds parens and we don't want it to
  } else if (
    t.isOptionalMemberExpression(expressionValue) &&
    propNames.includes(expressionValue?.property.name)
  ) {
    if (expressionValue?.object?.object) {
      newImageExpression = template.expression
        .ast`${expressionValue?.object?.object}?.childImageSharp?.gatsbyImageData`
    } else if (expressionValue?.object) {
      newImageExpression = template.expression
        .ast`${expressionValue?.object}?.gatsbyImageData`
    }

    newImageExpression.extra.parenthesized = false // the template adds parens and we don't want it to
  } else if (t.isObjectExpression(expressionValue)) {
    console.log(
      `It appears you're passing src or srcSet directly. This API is no longer exposed, please update ${state.opts.filename} manually.`
    )
  } else if (expressionValue) {
    console.log(
      `It appears you're passing a variable to your image component. We haven't changed it, but we have updated it to use the new GatsbyImage component. Please check ${state.opts.filename} manually.`
    )
  }

  // // create new prop
  const updatedAttribute = t.jsxAttribute(
    t.jsxIdentifier(`image`),
    t.jsxExpressionContainer(newImageExpression)
  )

  path.parentPath.replaceWith(
    t.jsxOpeningElement(
      componentName,
      [updatedAttribute, ...otherAttributes],
      true
    )
  )
  path.skip() // prevent us from revisiting these nodes
}

function processArguments(queryArguments, fragment, layout, state) {
  if (!legacyFragments.includes(fragment.name.value)) {
    let placeholderEnum = `BLURRED` // just in case these aren't the discrete cases we expect
    if (legacyFragmentsNoPlaceholder.includes(fragment.name?.value)) {
      placeholderEnum = `NONE`
    } else if (legacyFragmentsSVGPlaceholder.includes(fragment.name?.value)) {
      placeholderEnum = `TRACED_SVG`
    }
    const placeholderArgument = {
      kind: `Argument`,
      name: {
        kind: `Name`,
        value: `placeholder`,
      },
      value: {
        kind: `EnumValue`,
        value: placeholderEnum,
      },
    }
    queryArguments.push(placeholderArgument)
  }
  const transformOptionsToNest = []
  let newLayout = layout
  queryArguments.forEach((argument, index) => {
    if (argument.name.value === `maxWidth`) {
      argument.name.value = `width`
      if (layout === `fluid` && Number(argument.value.value) >= 1000) {
        delete queryArguments[index]
        const maxHeightIndex = queryArguments.findIndex(
          arg => arg?.name?.value === `maxHeight`
        )

        delete queryArguments?.[maxHeightIndex]

        console.log(
          `maxWidth is no longer supported for fluid (now fullWidth) images. It's been removed from your query in ${state.opts.filename}.`
        )
      } else if (layout === `fluid` && Number(argument.value.value) < 1000) {
        console.log(
          `maxWidth is no longer supported for fluid (now fullWidth) images. We've updated the query in ${state.opts.filename} to use a constrained image instead.`
        )
        newLayout = `constrained`
      }
    } else if (argument.name.value === `maxHeight`) {
      argument.name.value = `height`
      console.log(
        `maxHeight is no longer supported for fluid (now fullWidth) images. It's been removed from your query in ${state.opts.filename}.`
      )
    } else if (transformOptions.includes(argument.name.value)) {
      transformOptionsToNest.push(argument)
      delete queryArguments[index]
    } else if (otherOptions.includes(argument.name.value)) {
      console.log(
        `${argument.name.value} is now a nested value, please see the API docs and update the query in ${state.opts.filename} manually.`
      )
    }
  })
  if (transformOptionsToNest.length > 0) {
    const newOptions = {
      kind: `Argument`,
      name: { kind: `Name`, value: `transformOptions` },
      value: { kind: `ObjectValue`, fields: transformOptionsToNest },
    }
    queryArguments.push(newOptions)
  }
  return newLayout
}

function processGraphQLQuery(query, state) {
  try {
    let hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = graphql.parse(query)

    graphql.visit(ast, {
      SelectionSet(node) {
        const [sharpField] = node.selections.filter(
          ({ name }) => name?.value === `childImageSharp`
        )

        if (!sharpField) {
          return
        }
        const [fixedOrFluidField] = sharpField.selectionSet.selections.filter(
          ({ name }) => propNames.includes(name?.value)
        )

        if (!fixedOrFluidField) {
          return
        }
        let layout = fixedOrFluidField.name.value
        const fragments = fixedOrFluidField.selectionSet.selections

        const presentationSizeFragment = fragments.find(
          ({ name }) =>
            name.value === `GatsbyImageSharpFluidLimitPresentationSize`
        )
        if (presentationSizeFragment) {
          layout = `constrained`
          delete fragments[presentationSizeFragment]
        }
        layout = processArguments(
          fixedOrFluidField.arguments,
          fragments?.[0],
          layout,
          state
        )

        const typeArgument = {
          kind: `Argument`,
          name: {
            kind: `Name`,
            value: `layout`,
          },
          value: {
            kind: `EnumValue`,
            value: typeMapper[layout],
          },
        }

        fixedOrFluidField.name.value = `gatsbyImageData`

        fixedOrFluidField.arguments.push(typeArgument)
        delete fixedOrFluidField.selectionSet
        hasChanged = true
      },
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbyImageCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}
