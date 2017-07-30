// @flow
import React from "react"
import Link from "gatsby-link"
import injectSheet from "react-jss"

const styles = {
  heading: {
    padding: `10px`,
    backgroundColor: `darkturquoise`,
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

const HomePage = ({ classes }: Props) =>
  <div>
    <h1 className={classes.heading}>Home page</h1>
    <main className={classes.main}>
      <Link to="/detail">Go to Detail page</Link>
      <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-jss/">
        gatsby-plugin-jss docs
      </a>
    </main>
    <footer className={classes.footer}>
      The styling on this page is implemented with JSS and it works even with
      disabled JavaScript
    </footer>
  </div>

export default injectSheet(styles)(HomePage)
