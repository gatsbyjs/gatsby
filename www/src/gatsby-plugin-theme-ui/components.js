import React from "react"

import CodeBlock from "../components/code-block"
import MdxLink from "../components/mdx-link"
import CloudCallout from "../components/shared/cloud-callout"
import GuideList from "../components/guide-list.js"
import Pullquote from "../components/shared/pullquote"
import EggheadEmbed from "../components/shared/egghead-embed"
import GraphqlEmbed from "../components/graphql-embed"
import ComponentModel from "../components/layer-model/component-model"

export default {
  CloudCallout,
  GuideList,
  Pullquote,
  EggheadEmbed,
  GraphqlEmbed,
  ComponentModel,
  a: MdxLink,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}
