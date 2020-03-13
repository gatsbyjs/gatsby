/** @jsx jsx */
import { jsx } from "theme-ui"

// Get the full list of languages
import langs from "../../i18n.json"

export default function LangList() {
  return (
    <ul>
      {langs.map(({ name, localName, code }) => {
        return (
          <li key={code}>
            <a href={`https://github.com/gatsbyjs/gatsby-${code}`}>
              {name} / {localName}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
