import React from "react"

import CloudCallout from "../components/shared/cloud-callout"
import GuideList from "../components/guide-list.js"
import HubspotForm from "../components/hubspot-form"
import Pullquote from "../components/shared/pullquote"
import EggheadEmbed from "../components/shared/egghead-embed"
import DateChart from "../components/chart"
import ComponentModel from "../components/layer-model/component-model"
import ImageModel from "../components/layer-model/image-model"
import EmailCaptureForm from "../components/email-capture-form"
import HorizontalNavList from "../components/horizontal-nav-list"
import CodeBlock from "../components/code-block"
import MdxLink from "../components/mdx-link"
import Breakout from "../components/breakout"
import VisuallyHidden from "../components/visually-hidden"
import Events from "../components/events/events"
import StubList from "../components/stub-list"
import LangList from "../components/lang-list"
import ScriptLoader from "../components/script-loader"

export default {
  CloudCallout,
  GuideList,
  HubspotForm,
  DateChart,
  Pullquote,
  EggheadEmbed,
  ComponentModel,
  ImageModel,
  EmailCaptureForm,
  HorizontalNavList,
  Breakout,
  VisuallyHidden,
  Events,
  StubList,
  LangList,
  ScriptLoader,
  a: MdxLink,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>
}
