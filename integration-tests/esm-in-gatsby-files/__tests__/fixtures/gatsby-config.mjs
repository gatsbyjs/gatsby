// This fixture is moved during the test lifecycle

import helloDefaultESM from "./esm-default.mjs"
import { helloNamedESM } from "./esm-named.mjs"

helloDefaultESM()
helloNamedESM()

const config = {
  plugins: [],
}

export default config