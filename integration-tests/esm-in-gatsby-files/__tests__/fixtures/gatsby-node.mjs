// This fixture is moved during the test lifecycle

import helloDefaultESM from "./esm-default.mjs"
import { helloNamedESM } from "./esm-named.mjs"

helloDefaultESM()
helloNamedESM()

export const onPreBuild = () => {
  console.info(`gatsby-node-esm-on-pre-build`);
};
