const React = require("react");
const { useMDXComponents, mdx } = require("@mdx-js/react");
const { useMDXScope } = require("./context");

module.exports = function MDXRenderer({
  scope,
  components,
  children,
  ...props
}) {
  const mdxComponents = useMDXComponents(components);
  const mdxScope = useMDXScope(scope);

  if (!children) {
    return null;
  }

  const fullScope = {
    // React is here just in case the user doesn't pass them in
    // in a manual usage of the renderer
    React,
    mdx,
    ...mdxScope
  };

  // children is pre-compiled mdx
  const keys = Object.keys(fullScope);
  const values = keys.map(key => fullScope[key]);
  const fn = new Function("_fn", ...keys, `${children}`);

  const End = fn({}, ...values);
  return React.createElement(End, { components: mdxComponents, ...props });
};
