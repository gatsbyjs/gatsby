import type { RematchStore } from "@rematch/core"
import { init } from "@rematch/core"
import immerPlugin from "@rematch/immer"
import models from "./models"

const store: RematchStore<typeof models> = init({
  models,
  plugins: [immerPlugin()],
})

export default store
