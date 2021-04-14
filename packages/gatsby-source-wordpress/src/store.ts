import { init } from "@rematch/core"
import immerPlugin from "@rematch/immer"
import models from "./models"

// import type { RematchStore } from "@rematch/core"
// @todo any used to be RematchStore<typeof models> but this isn't exactly right..
// need to revisit this later. newer versions of rematch sorted TS out but
// there are a lot of breaking changes for us it seems
const store: any = init({
  models,
  plugins: [immerPlugin()],
})

export default store
