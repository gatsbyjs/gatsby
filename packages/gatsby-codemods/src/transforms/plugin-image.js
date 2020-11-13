// import { declare } from "@babel/helper-plugin-utils"
// import { transform } from "@babel/core"
// import { ImportSpecifier } from "jscodeshift"

// const src = `import { GatsbyImage } from "gatsby-plugin-image/compat"`

// const updateImport = new BabelPluginGatsbyImageImport({})

// transform(src, { plugins: [updateImport.plugin] })

// class BabelPluginGatsbyImageImport {
//   constructor() {
//     this.state = []

//     this.plugin = declare(api => {
//       api.assertVersion(7)

//       return {
//         visitor: {
//           ImportDeclaration: path => {
//             const { source } = path

//             if (source.value !== `gatsby-image`) {
//               return
//             }

//             specifiers => {}
//           },
//         },
//       }
//     })
//   }
// }

export default function UpdateImport(babel) {
  const { types: t } = babel
  let imageImportName = ``
  return {
    visitor: {
      ImportDefaultSpecifier: path => {
        const { parent } = path
        if (parent.type === `ImportDeclaration`) {
          if (parent.source.value !== `gatsby-image`) {
            return
          } else {
            imageImportName = path.node.local.name
            path.node.local.name = `{ GatsbyImage }`
          }
        }
      },
      JSXOpeningElement({ node }) {
        // t.isVariableDeclaration(path) === true
        if (node.name.name !== imageImportName) {
          return
        } else {
          node.name.name = `GatsbyImage`
          const [prop] = node.attributes.filter(
            ({ name }) => name.name === `fluid` || name.name === `fixed`
          )
          if (prop) {
            prop.name = t.JSXIdentifier(`image`)
            // data.file.childImageSharp.gatsbyImageData
            const newImageExpression = t.memberExpression(
              t.memberExpression(
                t.memberExpression(t.identifier(`data`), t.identifier(`file`)),
                t.identifier(`childImageSharp`)
              ),
              t.identifier(`gatsbyImageData`)
            )
            prop.value = t.JSXExpressionContainer(newImageExpression)
          }
        }
      },
    },
  }
}

// if (mainImage.value.expression.type === `Identifier`) {
//     mainImage.value.expression.name = `data.file.childImageSharp.gatsbyImageData`
// } else if (mainImage.value.expression.type === `MemberExpression`) {
// let subExpression = mainImage.value.expression.object
// while(subExpression) {
//   if (subExpression.property) {
//      subExpression.property.name = ``
//   } else {
//     subExpression.name = ``
//   }
//   subExpression = subExpression.object
// }
// }

// JSXOpeningElement: path => {
//     let imageType = `fixed`
//     const { node } = path
//     if (node.name.name !== imageImportName) {
//       return
//     } else {
//       node.name.name = `GatsbyImage`
//     }

//     const imageProps = node.attributes.filter(
//       attribute =>
//         attribute.name.name === `fixed` || attribute.name.name === `fluid`
//     )
//     if (imageProps.length > 0) {
//       const mainImage = imageProps[0]
//       imageType = mainImage.name.name
//       mainImage.name.name = `image`
//       console.log(mainImage.value.expression)
//     }
//   },
