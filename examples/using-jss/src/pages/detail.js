// @flow
import React from "react"
import { Link } from "gatsby"
import injectSheet from "react-jss"

const styles = {
  heading: {
    padding: `10px`,
    backgroundColor: `darksalmon`,
    color: `white`,
    fontFamily: `monospace`,
    fontWeight: 300,
  },
  main: {
    display: `flex`,
    justifyContent: `space-between`,
    fontFamily: `monospace`,
  },
  footer: {
    marginTop: `15px`,
    backgroundColor: `azure`,
    fontFamily: `monospace`,
  },
}

type Props = {
  classes: { [string]: string },
}

const DetailPage = ({ classes }: Props) => (
  <div>
    <h1 className={classes.heading}>Detail page</h1>
    <main className={classes.main}>
      <Link to="/">Go to Home page</Link>
      <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-jss/">
        gatsby-plugin-jss docs
      </a>
    </main>
    <footer className={classes.footer}>
      The styling on this page is implemented with JSS and it works even with
      disabled JavaScript
    </footer>
  </div>
)

export default injectSheet(styles)(DetailPage)
