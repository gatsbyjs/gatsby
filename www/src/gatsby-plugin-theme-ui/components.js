import React from "react"

import CodeBlock from "../components/code-block"
import MdxLink from "../components/mdx-link"
import GuideList from "../components/guide-list.js"
import Pullquote from "../components/shared/pullquote"
import EggheadEmbed from "../components/shared/egghead-embed"

export default {
  GuideList,
  Pullquote,
  EggheadEmbed,
  a: MdxLink,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}
