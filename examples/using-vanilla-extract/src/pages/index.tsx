import * as React from "react"
import VanillaExtractIcon from "../icons/vanilla-extract"
import * as styles from "../styles/index.css"
import "../styles/global.css"
import { ColorModeProvider, ColorModeToggle } from "../components/ColorModeToggle"

const IndexPage = () => (
  <ColorModeProvider>
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <ColorModeToggle />
        <div className={styles.spacer} />
        <div className={styles.content}>
          <VanillaExtractIcon />
          <h1 className={styles.title}>
            Hello World 🎉
          </h1>
          <p>This is my first component styled with vanilla-extract!</p>
          <div className={styles.spacer} />
          <a className={styles.button} href="https://vanilla-extract.style/">
            vanilla-extract Documentation
          </a>
        </div>
      </main>
    </div>
  </ColorModeProvider>
)

export default IndexPage
