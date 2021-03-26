process.env.GATSBY_SHOULD_TRACK_IMAGE_CDN_URLS = "true"

// See https://github.com/inrupt/solid-client-authn-js/issues/1676
if (
  typeof globalThis.TextEncoder === "undefined" ||
  typeof globalThis.TextDecoder === "undefined"
) {
  const { TextEncoder,TextDecoder } = require("node:util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
