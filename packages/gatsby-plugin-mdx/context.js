import React from "react";
import createReactContext from "create-react-context";

const { Provider, Consumer } = createReactContext({});

/* eslint-disable react/display-name */
export const withMDXScope = Component => ({ scope, ...props }) => (
  <Consumer>
    {contextScope => <Component scope={scope || contextScope} {...props} />}
  </Consumer>
);

export const MDXScopeProvider = ({ __mdxScope, children }) => (
  <Provider value={__mdxScope}>{children}</Provider>
);

/*
MDXProvider.propTypes = {
  __mdxScope: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};
*/
