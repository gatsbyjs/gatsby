process.env.GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS = "true"

// See https://github.com/inrupt/solid-client-authn-js/issues/1676
if (
  typeof globalThis.TextEncoder === "undefined" ||
  typeof globalThis.TextDecoder === "undefined"
) {
  const utils = require("util");
  globalThis.TextEncoder = utils.TextEncoder;
  globalThis.TextDecoder = utils.TextDecoder;
}
