import React from "react"
import { css } from "@emotion/core"
import GatsbyLogo from "../../monogram.svg"

const displayDate = date =>
  date.toLocaleDateString(`en-US`, {
    year: `numeric`,
    month: `long`,
    day: `numeric`,
  })

const Event = ({
  name,
  organizer_fname,
  organizer_lname,
  date,
  location,
  url,
  type,
  hasGatsbyTeamSpeaker,
}) => (
  <React.Fragment>
    <p
      css={css`
        margin: 1rem 0 0;
      `}
    >
      {hasGatsbyTeamSpeaker && (
        <img
          css={css`
            height: 18px;
            margin: 0.2rem 0.5rem 0 0;
            vertical-align: top;
            width: 18px;
          `}
          src={GatsbyLogo}
          alt="Gatsby"
          title="A Gatsby team member is speaking at this event!"
        />
      )}
      <strong>{url ? <a href={url}>{name}</a> : name}</strong> —{` `}
      {displayDate(date)}
      {` `}({location})
    </p>
    <p>
      <small>
        This {type.toLowerCase()} was submitted by {organizer_fname}
        {` `}
        {organizer_lname}.
      </small>
    </p>
  </React.Fragment>
)

export default Event
