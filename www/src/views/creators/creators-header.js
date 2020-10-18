/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "../../components/localized-link"
import Button from "../../components/button"
import { MdArrowForward as ArrowForwardIcon } from "react-icons/md"

export default function CreatorsHeader({
  /*forHire, hiring, */ submissionText,
}) {
  return (
    <div
      sx={{
        alignItems: `center`,
        backgroundColor: `navigation.background`,
        borderBottom: 1,
        borderColor: `ui.border`,
        display: `flex`,
        flexDirection: `row`,
        fontFamily: `heading`,
        height: `headerHeight`,
        px: 6,
        zIndex: `2`,
      }}
    >
      <h1
        css={{
          display: `flex`,
          height: `100%`,
          margin: 0,
        }}
      >
        <Link
          to="/creators/"
          state={{ filter: `` }}
          sx={{
            alignSelf: `center`,
            "&&": {
              borderBottom: `none`,
              color: `gatsby`,
              fontSize: 4,
              mr: 3,
              "&:hover": {
                backgroundColor: `initial`,
              },
            },
          }}
        >
          Creators
        </Link>
      </h1>
      <div
        className="creators--filters"
        css={{
          display: `flex`,
          flex: `2`,
        }}
      >
        <div
          css={{
            alignItems: `center`,
            display: `flex`,
            marginLeft: `auto`,
          }}
        >
          <Button
            variant="small"
            to="/contributing/submit-to-creator-showcase/"
            icon={<ArrowForwardIcon />}
          >
            {submissionText}
          </Button>
        </div>
      </div>
    </div>
  )
}
