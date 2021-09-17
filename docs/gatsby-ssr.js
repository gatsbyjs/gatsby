import * as React from 'react'
import Provider from './src/components/provider'

export const wrapRootElement = ({ element }) =>
  <Provider children={element} />
