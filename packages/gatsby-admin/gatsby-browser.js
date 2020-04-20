import React from 'react';
import Providers from './src/components/providers'

export const wrapPageElement = ({ element,props }) =>(
  <Providers {...props}>{element}</Providers>
)