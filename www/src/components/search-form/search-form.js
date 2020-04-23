/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { navigate } from "gatsby"
import { withI18n } from "@lingui/react"
import { t } from "@lingui/macro"

import SearchIcon from "../search-icon"
import { themedInput } from "../../utils/styles"

const loadJS = () => import(`./docsearch.min.js`)
let loadedJs = false

import { Global } from "@emotion/core"

import algoliaStyles from "./algolia-styles"

function SearchForm({ i18n }) {
  const [focused, setFocus] = React.useState(false)
  const [isInit, setInit] = React.useState(false)
  const searchInput = React.useRef(null)
  /**
   * Replace the default selection event, allowing us to do client-side
   * navigation thus avoiding a full page refresh.
   *
   * Ref: https://github.com/algolia/autocomplete.js#events
   */
  function autocompleteSelected(e) {
    e.stopPropagation()
    // Use an anchor tag to parse the absolute url (from autocomplete.js) into a relative url
    const a = document.createElement(`a`)
    a.href = e._args[0].url
    searchInput.current.blur()
    // Compare hash and slug and remove hash if both are same
    const paths = a.pathname.split(`/`).filter(el => el !== ``)
    const slug = paths[paths.length - 1]
    const path =
      `#${slug}` === a.hash ? `${a.pathname}` : `${a.pathname}${a.hash}`
    navigate(path)
  }

  function loadAlgoliaJS() {
    if (!loadedJs) {
      loadJS().then(a => {
        loadedJs = true
        window.docsearch = a.default
        setInit(true)
      })
    } else {
      setInit(true)
    }
  }

  React.useEffect(() => {
    if (isInit) {
      window.addEventListener(
        `autocomplete:selected`,
        autocompleteSelected,
        true
      )
      window.docsearch({
        apiKey: `71af1f9c4bd947f0252e17051df13f9c`,
        indexName: `gatsbyjs`,
        inputSelector: `#doc-search`,
        debug: false,
        autocompleteOptions: {
          openOnFocus: true,
          autoselect: true,
          hint: false,
          keyboardShortcuts: [`s`],
        },
      })
      searchInput.current.focus()
    }

    return () => {
      window.removeEventListener(
        `autocomplete:selected`,
        autocompleteSelected,
        true
      )
    }
  }, [isInit])

  React.useEffect(() => {
    if (
      typeof window === `undefined` ||
      typeof window.docsearch === `undefined`
    ) {
      // Algolia's docsearch lib not loaded yet so load it.
      // Lazy load css
      const path = `https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css`
      const link = document.createElement(`link`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`href`, path)
      document.head.appendChild(link)
    }
  })

  return (
    <form
      sx={{
        alignItems: `flex-end`,
        justifyContent: `flex-end`,
        display: `flex`,
        flex: [`1 1 auto`, null, `1 0 auto`, null, `0 0 auto`, `1 0 auto`],
        flexDirection: `row`,
        mb: 0,
        mx: [3, null, null, 4],
        position: `relative`,
        // minWidth: [null, null, null, null, `12rem`],
        // maxWidth: [`100%`, `100%`, `100%`, null, `24rem`],
        "& .algolia-autocomplete": {
          width: `100%`,
          display: `block !important`,
        },
      }}
      className="searchWrap"
      onMouseOver={() => loadAlgoliaJS()}
      onClick={() => loadAlgoliaJS()}
      onFocus={() => loadAlgoliaJS()}
      onSubmit={e => e.preventDefault()}
    >
      <Global styles={algoliaStyles} />
      <label
        sx={{
          position: `relative`,
          width: [`100%`, `100%`, `100%`, focused ? `14rem` : 24, `100%`],
          transition: t =>
            `width ${t.transition.speed.default} ${t.transition.curve.default}, padding ${t.transition.speed.default} ${t.transition.curve.default}`,
        }}
      >
        <input
          id="doc-search"
          sx={{
            ...themedInput,
            bg: [
              `themedInput.background`,
              null,
              null,
              focused ? `themedInput.background` : `transparent`,
              `themedInput.background`,
            ],
            pl: [7, null, null, focused ? 7 : 24, 7],
            width: [`100%`, null, null, focused ? `14rem` : 24, `100%`],
            transition: t =>
              `width ${t.transition.speed.default} ${t.transition.curve.default}, padding ${t.transition.speed.default} ${t.transition.curve.default}`,
          }}
          type="search"
          placeholder={i18n._(t`Search gatsbyjs.org`)}
          aria-label={i18n._(t`Search gatsbyjs.org`)}
          title={i18n._(t`Hit 's' to search docs`)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          ref={searchInput}
        />
        <SearchIcon focused={focused} />
      </label>
    </form>
  )
}

export default withI18n()(SearchForm)
