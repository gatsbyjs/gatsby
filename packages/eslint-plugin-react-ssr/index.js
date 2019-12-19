"use strict";

exports.__esModule = true;
exports.default = exports.rules = void 0;
const rules = {
  "no-globals": {
    create: context => {
      const unavailableConstants = [`window`, `document`];
      const exclusions = [`componentDidMount`, `useEffect`, `useLayoutEffect`];
      return {
        Identifier: node => {
          if (unavailableConstants.includes(node.name)) {
            // const ancestors = context.getAncestors(node)
            const scope = context.getScope(node); // console.log(ancestors, scope)
            // Class methods
            // if (!exclusions.includes(scope.block.parent.key.name)) {
            //   context.report({
            //     node,
            //     message: `Cannot use browser global ${
            //       node.name
            //     } during SSR unless it is in ${exclusions.join()}`,
            //   })
            // }
            // Hooks
            // console.log(scope.block.parent.callee)

            if (scope.block.parent.callee && !exclusions.includes(scope.block.parent.callee.name)) {
              context.report({
                node,
                message: `Cannot use browser global ${node.name} during SSR unless it is in ${exclusions.join()}`
              });
            } // Class methods
            // Call expressions for Hooks
            // Top level
            // Render
            // Conditionals

          }
        }
      };
    }
  }
};
exports.rules = rules;
var _default = {
  rules
};
exports.default = _default;