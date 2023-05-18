import type { IAdapterCtor } from "./types"

const createAdapter: IAdapterCtor = ({ reporter }) => {
  return {
    cache: {
      restore(directories): void {
        reporter.info(`[dev-adapter] cache.restore()`)
      },
      store(directories): void {
        reporter.info(`[dev-adapter] cache.store()`)
      },
    },
  }
}

export default createAdapter
