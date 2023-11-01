import { CyHttpMessages } from "cypress/types/net-stubbing"

/**
 * https://docs.cypress.io/api/commands/intercept#cyintercept-and-request-caching
 *
 * For responses that are to be cached we need to use a trick so browser doesn't cache them
 * So this enforces `no-store` cache-control header before response hits the browser
 * and then restore original cache-control value for assertions.
 */
export const WorkaroundCachedResponse = (
  req: CyHttpMessages.IncomingHttpRequest
): void | Promise<void> => {
  req.on("before:response", res => {
    res.headers["x-original-cache-control"] = res.headers["cache-control"]
    res.headers["cache-control"] = "no-store"
  })
  req.on("after:response", res => {
    res.headers["cache-control"] = res.headers["x-original-cache-control"]
    delete res.headers["x-original-cache-control"]
  })
}
