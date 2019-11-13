import React from "react"

import GuideList from "../components/guide-list.js"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import EggheadEmbed from "../components/shared/egghead-embed"
import DateChart from "../components/chart"
import CodeBlock from "../components/code-block"

export default {
  GuideList,
  HubspotForm,
  DateChart,
  Pullquote,
  EggheadEmbed,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}
