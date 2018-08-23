import { withMDXComponents } from "@mdx-js/tag/dist/mdx-provider";
import { withMDXScope } from "./context";

export default withMDXScope(
  withMDXComponents(({ scope = {}, components = {}, children, ...props }) => {
    const fullScope = {
      components,
      props,
      ...scope
    };

    // children is pre-compiled mdx
    const keys = Object.keys(fullScope);
    const values = keys.map(key => fullScope[key]);
    const fn = new Function("_fn", ...keys, `${children}`);

    const end = fn({}, ...values)({ components, ...props });
    return end;
  })
);
