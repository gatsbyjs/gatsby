import { breakpoints } from "./breakpoints"

let mq = {}
for (let breakpoint in breakpoints) {
  mq[breakpoint] = `@media (min-width: ${breakpoints[breakpoint]})`
}

export const mediaQueries = mq
