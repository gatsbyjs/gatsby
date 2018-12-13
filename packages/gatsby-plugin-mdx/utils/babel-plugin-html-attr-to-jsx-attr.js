const { camelCase } = require("change-case");
const toStyleObject = require("to-style").object;
const t = require("@babel/types");
const generate = require("@babel/generator");

var TRANSLATIONS = {
  class: "className",
  for: "htmlFor",
  srcset: "srcSet"
};

const valueFromType = value => {
  switch (typeof value) {
    case "string":
      return t.stringLiteral(value);
    case "number":
      return t.numericLiteral(value);
    case "boolean":
      return t.booleanLiteral(value);
    default:
      throw new Error("gatsby-mdx needs to include a new type");
  }
};

const propsKeysVisitor = {
  ObjectProperty(node) {
    if (node.node.key.extra.rawValue in TRANSLATIONS) {
      node.node.key.value =
        TRANSLATIONS[node.node.key.value] || node.node.key.value;
    }
  }
};
var jsxAttributeFromHTMLAttributeVisitor = {
  JSXAttribute: function(node) {
    if (node.node.name.name in TRANSLATIONS) {
      node.node.name.name = TRANSLATIONS[node.node.name.name];
    } else if (node.node.name.name === "props") {
      node.traverse(propsKeysVisitor);
    } else if (
      node.node.name.name.includes("-") &&
      !node.node.name.name.startsWith("data") &&
      !node.node.name.name.startsWith("aria")
    ) {
      node.node.name.name = camelCase(node.node.name.name);
    }
    if (
      node.node.name.name === "style" &&
      node.node.value.type === "StringLiteral"
      //      node.node.value.type !== "JSXExpressionContainer"
    ) {
      const styleObject = toStyleObject(node.node.value.extra.rawValue, {
        camelize: true
      });
      //      node.node.value.value = `{${JSON.stringify(styleObject)}}`;
      node.node.value = t.jSXExpressionContainer(
        t.objectExpression(
          Object.entries(styleObject).map(([key, value]) =>
            t.objectProperty(t.StringLiteral(key), valueFromType(value))
          )
        )
      );
    }
  }
};

module.exports = function attrs() {
  return {
    visitor: {
      JSXElement: function(path) {
        path.traverse(jsxAttributeFromHTMLAttributeVisitor);

        if (
          path.node.openingElement.name.name ===
          "annotation" /* && if gatsby-remark-katex is enabled*/
        ) {
          const genCode = path.node.children.map(
            ast => generate.default(ast).code
          );
          path.node.children = [
            t.jSXText(
              genCode
                .join("")
                .replace("{", "&#123;")
                .replace("}", "&#125;")
            )
          ];
        }
      }
    }
  };
};
