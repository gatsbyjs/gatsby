/** @jsx jsx */
import { jsx } from "theme-ui"
import { Menu, MenuButton, MenuList, MenuLink } from "@reach/menu-button"
import { MdTranslate } from "react-icons/md"
import { Link } from "gatsby"
import "@reach/menu-button/styles.css"

import { langs, getLocaleAndBasePath, localizedPath } from "../utils/i18n"

const allLangs = [
  { code: "en", name: "English", localName: "English" },
  ...langs,
]

function LangLink({ code, name, localName, pathname }) {
  const { basePath } = getLocaleAndBasePath(pathname)
  return (
    <MenuLink as={Link} to={localizedPath(code, basePath)} sx={{ p: 3 }}>
      {name} {localName}
    </MenuLink>
  )
}

export default function LanguageDropdown({ pathname }) {
  return (
    <Menu>
      <MenuButton sx={{ bg: `background`, border: 0 }}>
        <MdTranslate /> Languages
      </MenuButton>
      <MenuList
        sx={{ width: `16rem`, border: 0, boxShadow: `shadows.floating` }}
      >
        {allLangs.map(lang => (
          <LangLink {...lang} pathname={pathname} />
        ))}
      </MenuList>
    </Menu>
  )
}
