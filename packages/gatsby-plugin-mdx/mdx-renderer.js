const React = require("react");
const { withMDXComponents, mdx } = require("@mdx-js/react");
const { withMDXScope } = require("./context");

module.exports = withMDXScope(
  withMDXComponents(({ scope = {}, components = {}, children, ...props }) => {
    if (!children) {
      return null;
    }
    const fullScope = {
      // React is here just in case the user doesn't pass them in
      // in a manual usage of the renderer
      React,
      mdx,
      ...scope
    };

    // children is pre-compiled mdx
    const keys = Object.keys(fullScope);
    const values = keys.map(key => fullScope[key]);
    const fn = new Function("_fn", ...keys, `${children}`);

    const End = fn({}, ...values);
    return React.createElement(End, { components, ...props });
  })
);
