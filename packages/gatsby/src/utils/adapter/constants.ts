import type { IHeader } from "../../redux/types"

export const STATIC_PAGE_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=0, must-revalidate`,
  },
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

export const REDIRECT_HEADERS: IHeader["headers"] = [
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

export const ASSET_HEADERS: IHeader["headers"] = [
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

export const WEBPACK_ASSET_HEADERS: IHeader["headers"] = [
  {
    key: `cache-control`,
    value: `public, max-age=31536000, immutable`,
  },
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
