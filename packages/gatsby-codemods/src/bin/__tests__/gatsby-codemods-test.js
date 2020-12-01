let execaReturnValue

jest.setMock('execa', {
  sync: () => execaReturnValue
});

import path from 'path'
import fs from 'fs'

const {
  runTransform,
  transformerDirectory,
  jscodeshiftExecutable
} = require('../cli');

describe('runTransform', () => {
  it('finds transformer directory', () => {
    fs.lstatSync(transformerDirectory)
  })

  it('finds jscodeshift executable', () => {
    fs.lstatSync(jscodeshiftExecutable)
  })

  it('runs jscodeshift for the given transformer', () => {
    execaReturnValue = { error: null };
    console.log = jest.fn();
    runTransform(`gatsby-plugin-image`, `src`)
    
    expect(console.log).toBeCalledWith(
      `Executing command: jscodeshift --ignore-pattern=**/node_modules/** --extensions=jsx,js,ts,tsx --transform ${path.join(transformerDirectory, 'gatsby-plugin-image.js')} src`
    )
  })
})
