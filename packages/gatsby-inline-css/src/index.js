import React from 'react'

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw!${process.env.PUBLIC_DIR}/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

const htmlStyles = (args = {}) => {
  if (process.env.NODE_ENV === `production`) {
    return <style id="gatsby-inlined-css" dangerouslySetInnerHTML={{ __html: stylesStr }} />
  }

  // In dev just return an empty style element.
  return <style />
}

module.exports = htmlStyles
