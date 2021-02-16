import PostBodyComponents from "./src/components/post-body-components-ssr"

export function onRenderBody({ setPostBodyComponents }) {
  setPostBodyComponents(PostBodyComponents)
}
