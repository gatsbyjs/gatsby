import * as React from 'react'
import { MDXProvider } from '@mdx-js/react'

// import Link from './link'
import CodeBlock from './code-block'
import IFrame from './iframe'
import EggheadEmbed from './egghead-embed'

// TODO: look at these component
import ComponentModel from './mdx/layer-model/component-model'
import Pullquote from "./pullquote"
import GuideList from "./guide-list"
import CloudCallout from "./cloud-callout"

const components = {
  IFrame,
  EggheadEmbed,
  GuideList,
  ComponentModel,
  Pullquote,
  CloudCallout,
  pre: CodeBlock,
  // a: Link, using gatsby-plugin-catch-links instead
}

export default function Provider (props) {
  return (
    <MDXProvider
      {...props}
      components={components}
    />
  )
}
