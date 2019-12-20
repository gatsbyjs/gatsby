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

            /* Class Methods like componentDidMount, componentWillMount
             * and componentWillUnmount
             */

            if (scope.block.parent.key) {
              console.log(`Class`);

              if (!exclusions.includes(scope.block.parent.key.name)) {
                context.report({
                  node,
                  message: `Cannot use browser global ${node.name} during SSR`
                });
              }
            } // Hooks
            else if (scope.block.parent.callee) {
                console.log(`Hooks`);

                if (!exclusions.includes(scope.block.parent.callee.name)) {
                  context.report({
                    node,
                    message: `Cannot use browser global ${node.name} during SSR`
                  });
                  return;
                }
              } // Everything else
              else {
                  console.log(`Everything else`);
                  context.report({
                    node,
                    message: `Cannot use browser global ${node.name} during SSR`
                  });
                } // TODO: Handle Top Level
            // TODO: Conditionals

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