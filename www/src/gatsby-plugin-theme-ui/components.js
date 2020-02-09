import React from "react"

import GuideList from "../components/guide-list.js"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import EggheadEmbed from "../components/shared/egghead-embed"
import DateChart from "../components/chart"
import LayerModel from "../components/layer-model"
import EmailCaptureForm from "../components/email-capture-form"
import HorizontalNavList from "../components/horizontal-nav-list"
import CodeBlock from "../components/code-block"
import MdxLink from "../components/mdx-link"
import Breakout from "../components/breakout"
import VisuallyHidden from "../components/visually-hidden"
import Events from "../components/events/events"
import StubList from "../components/stub-list"

export default {
  GuideList,
  HubspotForm,
  DateChart,
  Pullquote,
  EggheadEmbed,
  LayerModel,
  EmailCaptureForm,
  HorizontalNavList,
  Breakout,
  VisuallyHidden,
  Events,
  StubList,
  a: MdxLink,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
}
