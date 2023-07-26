import type { IHeader } from "../../redux/types"

export const BASE_HEADERS: IHeader["headers"] = [
  {
    key: `x-xss-protection`,
    value: `1; mode=block`,
  },
  {
    key: `x-content-type-options`,
    value: `nosniff`,
  },
  {
    key: `referrer-policy`,
    value: `same-origin`,
  },
  {
    key: `x-frame-options`,
    value: `DENY`,
  },
]

export const MUST_REVALIDATE_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=0, must-revalidate`,
  },
  ...BASE_HEADERS,
]

export const PERMAMENT_CACHING_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=31536000, immutable`,
  },
  ...BASE_HEADERS,
]
